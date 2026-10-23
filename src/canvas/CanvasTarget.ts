import type { RefObject } from 'react';
import type { Canvas } from '@thorvg/webcanvas';

type LayoutListener = (width: number, height: number) => void;

const canvases = new WeakMap<CanvasTarget, Canvas>();

export function bindCanvas(target: CanvasTarget, canvas: Canvas): void {
  canvases.set(target, canvas);
}

export function unbindCanvas(target: CanvasTarget, canvas: Canvas): void {
  if (canvases.get(target) === canvas) canvases.delete(target);
}

export class CanvasTarget {
  readonly surfaceId: number;
  element: unknown = null;
  #width = 0;
  #height = 0;
  #listeners = new Set<LayoutListener>();

  constructor(surfaceId: number) {
    this.surfaceId = surfaceId;
  }

  get canvas(): Canvas | null {
    return canvases.get(this) ?? null;
  }

  get width(): number {
    return this.#width;
  }

  get height(): number {
    return this.#height;
  }

  layout(width: number, height: number): void {
    if (width === this.#width && height === this.#height) return;
    this.#width = width;
    this.#height = height;
    for (const listener of [...this.#listeners]) listener(width, height);
  }

  subscribe(listener: LayoutListener): () => void {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }
}

export type CanvasRef = RefObject<CanvasTarget | null>;

export function isCanvasRef(target: unknown): target is CanvasRef {
  return (
    !!target &&
    typeof target === 'object' &&
    'current' in target &&
    !(target instanceof CanvasTarget)
  );
}

export function resolveTarget(target: unknown): CanvasTarget | null {
  if (target instanceof CanvasTarget) return target;
  if (isCanvasRef(target) && target.current instanceof CanvasTarget) {
    return target.current;
  }
  return null;
}
