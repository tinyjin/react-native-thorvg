import { Fill } from './Fill';
import { getJSI } from '../jsi';

export class ConicGradient extends Fill {
  constructor(cx: number, cy: number, angle: number = 0) {
    const jsi = getJSI();
    const handle = jsi.tvg_conic_gradient_new();
    super(handle);
    jsi.tvg_conic_gradient_set(handle, cx, cy, angle);
  }

  public build(): this {
    this._applyStops();
    return this;
  }
}
