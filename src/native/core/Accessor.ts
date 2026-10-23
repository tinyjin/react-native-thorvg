import { NativeObject } from '../NativeObject';
import { Paint } from './Paint';
import { registerCallback, unregisterCallback } from '../callbacks';
import { checkResult } from '../errors';
import { getJSI, type Handle } from '../jsi';

export class Accessor extends NativeObject {
  constructor() {
    super(getJSI().tvg_accessor_new());
  }

  protected _cleanup(handle: Handle): void {
    getJSI().tvg_accessor_del(handle);
  }

  static id(name: string): number {
    return getJSI().tvg_accessor_generate_id(name);
  }

  public set(paint: Paint, callback: (paint: Paint) => boolean): void {
    const id = registerCallback((handle: Handle) =>
      callback(Paint.fromHandle(handle))
    );
    try {
      checkResult(
        getJSI().tvg_accessor_set(this.handle, paint.handle, id),
        'Accessor.set'
      );
    } finally {
      unregisterCallback(id);
    }
  }

  public name(id: number): string | null {
    return getJSI().tvg_accessor_get_name(this.handle, id);
  }
}
