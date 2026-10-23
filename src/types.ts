import type { Ref } from 'react';
import type { ViewProps } from 'react-native';
import type {
  Canvas,
  CanvasOptions,
  CanvasTarget as WebCanvasTarget,
  InitOptions as WebCanvasInitOptions,
  ThorVGNamespace,
} from '@thorvg/webcanvas';
import type { CanvasRef, CanvasTarget } from './components/CanvasTarget';

export type AndroidBackingView = 'TextureView' | 'SurfaceView';

export interface CanvasProps extends ViewProps {
  ref?: Ref<CanvasTarget>;
  androidBackingView?: AndroidBackingView;
}

export type ThorVG = Omit<ThorVGNamespace, 'Canvas' | 'Video'> & {
  Canvas: new (
    target: CanvasRef | CanvasTarget | string | WebCanvasTarget,
    options?: CanvasOptions
  ) => Canvas;
};

export type InitOptions = WebCanvasInitOptions;
