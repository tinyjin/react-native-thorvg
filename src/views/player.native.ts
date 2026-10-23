import type { Canvas as WebCanvas, LottieAnimation } from '@thorvg/webcanvas';
import { registerCallback, unregisterCallback } from '../native/callbacks';
import type { Canvas } from '../native/core/Canvas';
import type { Animation } from '../native/core/Animation';
import { getJSI } from '../native/jsi';
import type { Player, PlayerEvents, PlayMode } from './player';

export type { Player, PlayerConfig, PlayerEvents, PlayMode } from './player';

const MODES: Record<PlayMode, number> = {
  'forward': 0,
  'reverse': 1,
  'bounce': 2,
  'reverse-bounce': 3,
};

export function createPlayer(
  canvas: WebCanvas,
  animation: LottieAnimation
): Player {
  const jsi = getJSI();
  const canvasHandle = (canvas as unknown as Canvas)._handle;
  const handle = canvasHandle
    ? jsi.player_create(
        canvasHandle,
        (animation as unknown as Animation).handle
      )
    : null;
  let events: PlayerEvents = {};
  let listener = 0;

  const onEvent = (event: string, frame: number) => {
    if (event === 'frame') events.onFrame?.(frame);
    else if (event === 'loop') events.onLoop?.();
    else if (event === 'complete') events.onComplete?.();
  };

  const player: Player = {
    configure({ speed, loop, mode, start, end }) {
      if (handle) {
        jsi.player_configure(handle, speed, loop, MODES[mode], start, end);
      }
    },
    setEvents(next) {
      events = next;
      if (!handle) return;
      if (!listener) listener = registerCallback(onEvent);
      jsi.player_set_listener(handle, listener, !!next.onFrame);
    },
    play() {
      if (handle) jsi.player_play(handle);
    },
    pause() {
      if (handle) jsi.player_pause(handle);
    },
    reset() {
      if (handle) jsi.player_reset(handle);
    },
    seek(frame) {
      if (handle) jsi.player_seek(handle, frame);
    },
    frame: () => (handle ? jsi.player_frame(handle) : 0),
    playing: () => (handle ? jsi.player_playing(handle) : false),
    destroy() {
      if (handle) jsi.player_destroy(handle);
      if (listener) unregisterCallback(listener);
      listener = 0;
      events = {};
    },
  };
  return player;
}
