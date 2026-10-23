export type ContentFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

export interface ContentPosition {
  x?: number;
  y?: number;
}

export interface Placement {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function place(
  view: { width: number; height: number },
  content: { width: number; height: number },
  fit: ContentFit,
  position: ContentPosition = {}
): Placement | null {
  if (view.width <= 0 || view.height <= 0) return null;
  if (content.width <= 0 || content.height <= 0) return null;

  let width = content.width;
  let height = content.height;
  if (fit === 'fill') {
    width = view.width;
    height = view.height;
  } else if (fit !== 'none') {
    const sx = view.width / content.width;
    const sy = view.height / content.height;
    let scale = fit === 'cover' ? Math.max(sx, sy) : Math.min(sx, sy);
    if (fit === 'scale-down') scale = Math.min(scale, 1);
    width = content.width * scale;
    height = content.height * scale;
  }

  return {
    x: (view.width - width) * (position.x ?? 0.5),
    y: (view.height - height) * (position.y ?? 0.5),
    width,
    height,
  };
}
