import { useEffect, useRef, useState } from 'react';
import { getInitialized, init } from './init';
import type { InitOptions, ThorVG } from './types';

export function useThorVG(options?: InitOptions): ThorVG | null {
  const [thorvg, setThorVG] = useState<ThorVG | null>(getInitialized);
  const [error, setError] = useState<unknown>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    if (thorvg) return;
    let active = true;
    init(optionsRef.current).then(
      (namespace) => {
        if (active) setThorVG(namespace);
      },
      (reason: unknown) => {
        if (active)
          setError(reason ?? new Error('ThorVG initialization failed'));
      }
    );
    return () => {
      active = false;
    };
  }, [thorvg]);

  if (error) {
    throw error;
  }

  return thorvg;
}
