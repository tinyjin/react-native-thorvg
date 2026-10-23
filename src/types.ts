import type { ReactElement, Ref } from 'react';
import type { ViewProps } from 'react-native';
import type {
  Canvas,
  CanvasOptions,
  InitOptions as WebCanvasInitOptions,
  ThorVGNamespace,
} from '@thorvg/webcanvas';

export type AndroidBackingView = 'TextureView' | 'SurfaceView';

export interface CanvasProps extends CanvasOptions, ViewProps {
  ref?: Ref<Canvas>;
  androidBackingView?: AndroidBackingView;
}

export type CanvasComponent = (props: CanvasProps) => ReactElement | null;

export type ThorVG = Omit<ThorVGNamespace, 'Canvas' | 'Video'> & {
  Canvas: CanvasComponent;
};

export type InitOptions = WebCanvasInitOptions;
