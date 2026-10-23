type Callback = (...args: never[]) => unknown;

const callbacks = new Map<number, Callback>();
let nextId = 1;

function dispatch(id: number, ...args: unknown[]): unknown {
  const callback = callbacks.get(id);
  return callback ? (callback as (...a: unknown[]) => unknown)(...args) : false;
}

export function registerCallback(callback: Callback): number {
  globalThis.__thorvgCallback = dispatch;
  const id = nextId++;
  callbacks.set(id, callback);
  return id;
}

export function unregisterCallback(id: number): void {
  callbacks.delete(id);
}
