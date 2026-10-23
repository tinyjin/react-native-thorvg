import { Fill } from './Fill';
import { getJSI } from '../jsi';

export class RadialGradient extends Fill {
  constructor(
    cx: number,
    cy: number,
    r: number,
    fx: number = cx,
    fy: number = cy,
    fr: number = 0
  ) {
    const jsi = getJSI();
    const handle = jsi.tvg_radial_gradient_new();
    super(handle);
    jsi.tvg_radial_gradient_set(handle, cx, cy, r, fx, fy, fr);
  }

  public build(): this {
    this._applyStops();
    return this;
  }
}
