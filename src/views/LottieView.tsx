import { useCallback, useEffect, useRef, useState, type Ref } from 'react';
import type { LayoutChangeEvent, ViewProps } from 'react-native';
import type {
  AnimationInfo,
  Canvas as WebCanvas,
  LottieAnimation,
  LottieSlotData,
} from '@thorvg/webcanvas';
import { assignRef } from '../canvas/assignRef';
import { Canvas } from '../canvas/Canvas';
import { useThorVG } from '../useThorVG';
import { place, type ContentFit, type ContentPosition } from './fit';
import { loadSource, sourceKey, type LottieSource } from './source';

export type LottieMode = 'forward' | 'reverse' | 'bounce' | 'reverse-bounce';

export interface LottieViewHandle {
  readonly animation: LottieAnimation | null;
  readonly canvas: WebCanvas | null;
  play(): void;
  pause(): void;
  stop(): void;
  seek(frame: number): void;
}

export interface LottieViewProps extends ViewProps {
  ref?: Ref<LottieViewHandle>;
  source: LottieSource;
  autoplay?: boolean;
  loop?: boolean;
  speed?: number;
  mode?: LottieMode;
  segment?: readonly [number, number] | string;
  progress?: number;
  slots?: LottieSlotData | string;
  contentFit?: ContentFit;
  contentPosition?: ContentPosition;
  onLoad?: (info: AnimationInfo) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
  onLoop?: () => void;
  onFrame?: (frame: number) => void;
}

interface State {
  canvas: WebCanvas;
  animation: LottieAnimation | null;
  info: AnimationInfo | null;
  slot: number | null;
  frame: number;
  direction: 1 | -1;
  playing: boolean;
  rafId: number;
  last: number;
  layout: { width: number; height: number };
  size: { width: number; height: number };
}

function range(
  state: State,
  segment: LottieViewProps['segment']
): [number, number] {
  const total = Math.max(0, (state.info?.totalFrames ?? 1) - 1);
  if (typeof segment === 'string') {
    const animation = state.animation;
    for (let i = 0; i < (animation?.markersCnt() ?? 0); i++) {
      const marker = animation?.marker(i);
      if (marker?.name === segment) return [marker.begin, marker.end];
    }
    return [0, total];
  }
  if (segment) return [segment[0], segment[1]];
  return [0, total];
}

export type LottieView = LottieViewHandle;

export function LottieView({
  ref,
  source,
  autoplay = false,
  loop = false,
  speed = 1,
  mode = 'forward',
  segment,
  progress,
  slots,
  contentFit = 'contain',
  contentPosition,
  onLoad,
  onError,
  onComplete,
  onLoop,
  onFrame,
  onLayout,
  ...rest
}: LottieViewProps) {
  const TVG = useThorVG();
  const view = useRef<Canvas>(null);
  const state = useRef<State | null>(null);
  const [loaded, setLoaded] = useState(0);
  const latest = {
    source,
    loop,
    speed,
    mode,
    segment,
    contentFit,
    contentPosition,
    onLoad,
    onError,
    onComplete,
    onLoop,
    onFrame,
  };
  const props = useRef(latest);
  props.current = latest;

  const draw = useCallback(() => {
    const current = state.current;
    if (!current?.info || !current.animation) return;
    current.animation.frame(current.frame);
    current.canvas.update().render();
    props.current.onFrame?.(current.frame);
  }, []);

  const layout = useCallback(() => {
    const current = state.current;
    const picture = current?.info ? current.animation?.picture : null;
    if (!current || !picture) return;
    if (!picture) return;
    const placement = place(
      current.layout,
      current.size,
      props.current.contentFit,
      props.current.contentPosition
    );
    if (!placement) return;
    picture.size(placement.width, placement.height);
    picture.translate(placement.x, placement.y);
    current.canvas.update().render();
  }, []);

  const tick = useCallback(
    (time: number) => {
      const current = state.current;
      if (!current?.info || !current.playing) return;
      const { loop: repeat, speed: rate, mode: playMode } = props.current;
      const [start, end] = range(current, props.current.segment);
      const elapsed = current.last ? (time - current.last) / 1000 : 0;
      current.last = time;

      let frame =
        current.frame + elapsed * current.info.fps * rate * current.direction;
      const bounce = playMode === 'bounce' || playMode === 'reverse-bounce';
      if (frame > end || frame < start) {
        const finished = bounce
          ? (playMode === 'bounce') === (current.direction === -1)
          : true;
        if (bounce && (!finished || repeat)) {
          current.direction = current.direction === 1 ? -1 : 1;
          frame = frame > end ? end : start;
          if (finished) props.current.onLoop?.();
        } else if (repeat) {
          frame = current.direction === 1 ? start : end;
          props.current.onLoop?.();
        } else {
          current.frame = frame > end ? end : start;
          current.playing = false;
          draw();
          props.current.onComplete?.();
          return;
        }
      }
      current.frame = frame;
      draw();
      current.rafId = requestAnimationFrame(tick);
    },
    [draw]
  );

  const reset = useCallback(() => {
    const current = state.current;
    if (!current?.info) return;
    const [start, end] = range(current, props.current.segment);
    const reverse =
      props.current.mode === 'reverse' ||
      props.current.mode === 'reverse-bounce';
    current.direction = reverse ? -1 : 1;
    current.frame = reverse ? end : start;
  }, []);

  const handle = useRef<LottieViewHandle>({
    get animation() {
      return state.current?.animation ?? null;
    },
    get canvas() {
      return state.current?.canvas ?? null;
    },
    play() {
      const current = state.current;
      if (!current?.info || current.playing) return;
      current.playing = true;
      current.last = 0;
      current.rafId = requestAnimationFrame(tick);
    },
    pause() {
      const current = state.current;
      if (!current) return;
      current.playing = false;
      cancelAnimationFrame(current.rafId);
    },
    stop() {
      handle.current.pause();
      reset();
      draw();
    },
    seek(frame: number) {
      const current = state.current;
      if (!current?.info) return;
      current.frame = frame;
      draw();
    },
  });

  useEffect(() => {
    assignRef(ref, handle.current);
    return () => assignRef(ref, null);
  }, [ref]);

  useEffect(() => {
    if (!TVG) return;
    const canvas = new TVG.Canvas(view);
    state.current = {
      canvas,
      animation: null,
      info: null,
      slot: null,
      frame: 0,
      direction: 1,
      playing: false,
      rafId: 0,
      last: 0,
      layout: {
        width: view.current?.width ?? 0,
        height: view.current?.height ?? 0,
      },
      size: { width: 0, height: 0 },
    };
    return () => {
      const current = state.current;
      state.current = null;
      if (current) cancelAnimationFrame(current.rafId);
      current?.animation?.dispose();
      canvas.destroy();
    };
  }, [TVG]);

  const key = sourceKey(source);
  useEffect(() => {
    const current = state.current;
    if (!current || !TVG) return;
    let active = true;
    loadSource(props.current.source).then(
      (data) => {
        if (!active || state.current !== current) return;
        handle.current.pause();
        const animation = new TVG.LottieAnimation();
        animation.load(data);
        const previous = current.animation;
        if (previous?.picture) current.canvas.remove(previous.picture);
        previous?.dispose();
        current.animation = animation;
        current.info = animation.info();
        current.slot = null;
        current.size = animation.picture?.size() ?? { width: 0, height: 0 };
        if (animation.picture) current.canvas.add(animation.picture);
        setLoaded((n) => n + 1);
        if (current.info) props.current.onLoad?.(current.info);
      },
      (error: unknown) => {
        if (!active) return;
        props.current.onError?.(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    );
    return () => {
      active = false;
    };
  }, [TVG, key]);

  useEffect(() => {
    const current = state.current;
    const animation = current?.animation;
    if (!current?.info || !animation || slots === undefined) return;
    if (current.slot !== null) animation.del(current.slot);
    current.slot = animation.gen(slots);
    animation.apply(current.slot);
    draw();
  }, [loaded, slots, draw]);

  useEffect(() => {
    layout();
  }, [loaded, contentFit, contentPosition, layout]);

  const segmentKey = Array.isArray(segment) ? segment.join(':') : segment;
  useEffect(() => {
    const current = state.current;
    if (!current?.info) return;
    if (progress !== undefined) {
      handle.current.pause();
      const [start, end] = range(current, props.current.segment);
      const t = Math.min(1, Math.max(0, progress));
      current.frame = start + (end - start) * t;
      draw();
      return;
    }
    reset();
    draw();
    if (autoplay) handle.current.play();
  }, [loaded, progress, segmentKey, mode, autoplay, draw, reset]);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const current = state.current;
      if (current) {
        current.layout = {
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height,
        };
        layout();
      }
      onLayout?.(event);
    },
    [layout, onLayout]
  );

  return <Canvas {...rest} ref={view} onLayout={handleLayout} />;
}
