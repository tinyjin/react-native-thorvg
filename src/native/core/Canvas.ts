import type { CanvasOptions } from '@thorvg/webcanvas';
import { PixelRatio } from 'react-native';
import type { Paint } from './Paint';
import { Scene } from './Scene';
import { checkResult, handleError } from '../errors';
import { EngineOption } from '../generated/constants';
import { getJSI, type CanvasHandle } from '../jsi';

function devicePixelRatio(): number {
  return 1 + (PixelRatio.get() - 1) * 0.75;
}

export class Canvas {
  #handle: CanvasHandle | null = null;
  #mainScene: Scene | null = null;
  #enableDevicePixelRatio: boolean;
  #logicalWidth: number;
  #logicalHeight: number;
  #currentDPR: number = 1;
  #needsUpdate: boolean = false;

  constructor(surfaceId: number, options: CanvasOptions = {}) {
    const {
      width = 800,
      height = 600,
      enableDevicePixelRatio = true,
      engineOption = EngineOption.Default,
    } = options;

    this.#logicalWidth = width;
    this.#logicalHeight = height;
    this.#enableDevicePixelRatio = enableDevicePixelRatio;

    const jsi = getJSI();
    const handle = jsi.canvas_create(surfaceId, engineOption);
    if (!handle) {
      handleError(
        'Failed to create canvas with sw renderer',
        'Canvas constructor'
      );
      return;
    }
    this.#handle = handle;

    this.#currentDPR = enableDevicePixelRatio ? devicePixelRatio() : 1;
    this.#applySize();

    this.#mainScene = new Scene();
    if (enableDevicePixelRatio) {
      this.#mainScene.scale(this.#currentDPR);
    }
    checkResult(
      jsi.tvg_canvas_add(handle, this.#mainScene.handle),
      'add main scene'
    );
    jsi.tvg_paint_ref(this.#mainScene.handle);
  }

  public add(paint: Paint): this {
    if (!this.#mainScene) {
      handleError('Main scene not initialized', 'add');
      return this;
    }
    this.#mainScene.add(paint);
    this.#needsUpdate = true;
    return this;
  }

  public remove(paint?: Paint): this {
    if (!this.#mainScene) {
      handleError('Main scene not initialized', 'remove');
      return this;
    }
    if (paint) {
      this.#mainScene.remove(paint);
    } else {
      this.#mainScene.remove();
    }
    this.#needsUpdate = true;
    return this;
  }

  public clear(): this {
    if (!this.#handle || !this.#mainScene) {
      return this;
    }
    this.#mainScene.clear();
    getJSI().canvas_render(this.#handle);
    return this;
  }

  public update(): this {
    if (!this.#handle) {
      return this;
    }
    checkResult(getJSI().tvg_canvas_update(this.#handle), 'update');
    return this;
  }

  public render(): this {
    if (!this.#handle || !this.#mainScene) {
      return this;
    }

    const jsi = getJSI();

    if (this.#needsUpdate) {
      jsi.tvg_canvas_update(this.#handle);
      this.#needsUpdate = false;
    }

    if (this.#enableDevicePixelRatio) {
      const dpr = devicePixelRatio();
      if (dpr !== this.#currentDPR) {
        this.#currentDPR = dpr;
        this.#mainScene.transform({
          e11: dpr,
          e12: 0,
          e13: 0,
          e21: 0,
          e22: dpr,
          e23: 0,
          e31: 0,
          e32: 0,
          e33: 1,
        });
        this.#applySize();
      }
    }

    jsi.canvas_render(this.#handle);
    return this;
  }

  public resize(width: number, height: number): this {
    this.#logicalWidth = width;
    this.#logicalHeight = height;
    this.#applySize();
    return this;
  }

  public viewport(x: number, y: number, w: number, h: number): this {
    if (!this.#handle) {
      return this;
    }
    checkResult(
      getJSI().tvg_canvas_set_viewport(this.#handle, x, y, w, h),
      'viewport'
    );
    return this;
  }

  public destroy(): void {
    if (this.#mainScene) {
      this.#mainScene.clear();
      this.#mainScene.dispose();
      this.#mainScene = null;
    }
    if (this.#handle) {
      getJSI().canvas_destroy(this.#handle);
      this.#handle = null;
    }
  }

  public get renderer(): string {
    return 'sw';
  }

  public get dpr(): number {
    return this.#currentDPR;
  }

  #applySize(): void {
    if (!this.#handle) return;
    const dpr = this.#enableDevicePixelRatio ? this.#currentDPR : 1;
    const width = Math.max(1, Math.floor(this.#logicalWidth * dpr));
    const height = Math.max(1, Math.floor(this.#logicalHeight * dpr));
    getJSI().canvas_resize(this.#handle, width, height);
  }
}
