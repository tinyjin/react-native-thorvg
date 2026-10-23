export type Color =
  | string
  | readonly [number, number, number]
  | readonly [number, number, number, number];

export function rgba(color: Color): [number, number, number, number] {
  if (typeof color !== 'string') {
    return [color[0], color[1], color[2], color[3] ?? 255];
  }
  let hex = color.startsWith('#') ? color.slice(1) : color;
  if (hex.length === 3 || hex.length === 4) {
    hex = [...hex].map((c) => c + c).join('');
  }
  const value = (i: number) => parseInt(hex.slice(i, i + 2), 16);
  return [value(0), value(2), value(4), hex.length >= 8 ? value(6) : 255];
}
