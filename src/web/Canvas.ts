import {
  Canvas as WebCanvas,
  type CanvasOptions,
  type CanvasTarget as WebCanvasTarget,
} from '@thorvg/webcanvas';
import {
  isCanvasRef,
  resolveTarget,
  type CanvasRef,
  type CanvasTarget,
} from '../components/CanvasTarget';

const elements = new WeakMap<WebCanvas, unknown>();
const subscriptions = new WeakMap<WebCanvas, () => void>();

function fit(element: unknown): void {
  const style = (element as { style?: Record<string, string> } | null)?.style;
  if (!style) return;
  style.width = '100%';
  style.height = '100%';
}

export class Canvas extends WebCanvas {
  constructor(
    target: string | WebCanvasTarget | CanvasTarget | CanvasRef,
    options: CanvasOptions = {}
  ) {
    const surface = resolveTarget(target);
    if (!surface && isCanvasRef(target)) {
      throw new Error('ThorVG: the Canvas view is not mounted');
    }
    super(
      (surface ? surface.element : target) as string | WebCanvasTarget,
      surface
        ? {
            ...options,
            width: options.width ?? Math.max(1, surface.width),
            height: options.height ?? Math.max(1, surface.height),
          }
        : options
    );
    if (!surface) return;

    elements.set(this, surface.element);
    fit(surface.element);
    if (options.width === undefined || options.height === undefined) {
      subscriptions.set(
        this,
        surface.subscribe((width, height) => {
          this.resize(options.width ?? width, options.height ?? height);
          this.render();
        })
      );
    }
  }

  override resize(width: number, height: number): this {
    super.resize(width, height);
    fit(elements.get(this));
    return this;
  }

  override destroy(): void {
    subscriptions.get(this)?.();
    subscriptions.delete(this);
    super.destroy();
  }
}
