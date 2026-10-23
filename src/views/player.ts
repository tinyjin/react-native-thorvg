import type { Canvas as WebCanvas, LottieAnimation } from '@thorvg/webcanvas';

export type PlayMode = 'forward' | 'reverse' | 'bounce' | 'reverse-bounce';

export interface PlayerConfig {
  speed: number;
  loop: boolean;
  mode: PlayMode;
  start: number;
  end: number;
}

export interface PlayerEvents {
  onFrame?: (frame: number) => void;
  onLoop?: () => void;
  onComplete?: () => void;
}

export interface Player {
  configure(config: PlayerConfig): void;
  setEvents(events: PlayerEvents): void;
  play(): void;
  pause(): void;
  reset(): void;
  seek(frame: number): void;
  frame(): number;
  playing(): boolean;
  destroy(): void;
}

export function createPlayer(
  canvas: WebCanvas,
  animation: LottieAnimation
): Player {
  const fps = animation.info()?.fps ?? 0;
  let config: PlayerConfig = {
    speed: 1,
    loop: false,
    mode: 'forward',
    start: 0,
    end: 0,
  };
  let events: PlayerEvents = {};
  let frame = 0;
  let direction = 1;
  let playing = false;
  let rafId = 0;
  let last = 0;

  const draw = () => {
    animation.frame(frame);
    canvas.update().render();
    events.onFrame?.(frame);
  };

  const tick = (time: number) => {
    if (!playing) return;
    const { loop, speed, mode, start, end } = config;
    const elapsed = last ? (time - last) / 1000 : 0;
    last = time;

    let next = frame + elapsed * fps * speed * direction;
    const bounce = mode === 'bounce' || mode === 'reverse-bounce';
    if (next > end || next < start) {
      const finished = bounce
        ? (mode === 'bounce') === (direction === -1)
        : true;
      if (bounce && (!finished || loop)) {
        direction = -direction;
        next = next > end ? end : start;
        if (finished) events.onLoop?.();
      } else if (loop) {
        next = direction === 1 ? start : end;
        events.onLoop?.();
      } else {
        frame = next > end ? end : start;
        playing = false;
        draw();
        events.onComplete?.();
        return;
      }
    }
    frame = next;
    draw();
    rafId = requestAnimationFrame(tick);
  };

  const player: Player = {
    configure(next) {
      config = next;
    },
    setEvents(next) {
      events = next;
    },
    play() {
      if (playing) return;
      playing = true;
      last = 0;
      rafId = requestAnimationFrame(tick);
    },
    pause() {
      playing = false;
      cancelAnimationFrame(rafId);
    },
    reset() {
      const reverse =
        config.mode === 'reverse' || config.mode === 'reverse-bounce';
      direction = reverse ? -1 : 1;
      frame = reverse ? config.end : config.start;
      draw();
    },
    seek(next) {
      frame = next;
      draw();
    },
    frame: () => frame,
    playing: () => playing,
    destroy() {
      player.pause();
      events = {};
    },
  };
  return player;
}
