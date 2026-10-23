import { Fill } from './Fill';
import { getJSI } from '../jsi';

export class LinearGradient extends Fill {
  constructor(x1: number, y1: number, x2: number, y2: number) {
    const jsi = getJSI();
    const handle = jsi.tvg_linear_gradient_new();
    super(handle);
    jsi.tvg_linear_gradient_set(handle, x1, y1, x2, y2);
  }

  public build(): this {
    this._applyStops();
    return this;
  }
}
