import { handleError } from './errors';
import { getJSI, type Handle } from './jsi';

export abstract class NativeObject {
  #handle: Handle | null;
  #disposed: boolean = false;

  constructor(handle: Handle | null) {
    this.#handle = handle;
  }

  public get handle(): Handle {
    if (this.#disposed || !this.#handle) {
      handleError('Object has been disposed', 'handle getter');
    }
    return this.#handle as Handle;
  }

  public get ptr(): number {
    if (this.#disposed) {
      handleError('Object has been disposed', 'ptr getter');
      return 0;
    }
    return this.#handle ? getJSI().address(this.#handle) : 0;
  }

  public dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;

    const handle = this.#handle;
    this.#handle = null;
    if (handle) {
      getJSI().disown(handle);
      this._cleanup(handle);
    }
  }

  public get isDisposed(): boolean {
    return this.#disposed;
  }

  protected abstract _cleanup(handle: Handle): void;
}
