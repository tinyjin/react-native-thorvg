import { createNamespace } from './platform';
import type { InitOptions, ThorVG } from './types';

let pending: Promise<ThorVG> | null = null;
let resolved: ThorVG | null = null;

function reset(): void {
  pending = null;
  resolved = null;
}

export function init(options: InitOptions = {}): Promise<ThorVG> {
  if (!pending) {
    pending = createNamespace(options, reset).then(
      (namespace) => {
        resolved = namespace;
        return namespace;
      },
      (error: unknown) => {
        reset();
        throw error;
      }
    );
  }
  return pending;
}

export function getInitialized(): ThorVG | null {
  return resolved;
}
