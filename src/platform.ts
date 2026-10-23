import { init as initWebCanvas } from '@thorvg/webcanvas';
import { Canvas } from './components/Canvas';
import type { InitOptions, ThorVG } from './types';

export { ThorVGError, ThorVGResultCode } from '@thorvg/webcanvas';

export async function createNamespace(
  options: InitOptions,
  onTerm: () => void
): Promise<ThorVG> {
  const namespace = await initWebCanvas(options);
  return {
    ...namespace,
    Canvas,
    term: () => {
      namespace.term();
      onTerm();
    },
  };
}
