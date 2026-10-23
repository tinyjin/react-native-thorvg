import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  surfaceId: CodegenTypes.Int32;
  androidBackingView?: CodegenTypes.WithDefault<
    'TextureView' | 'SurfaceView',
    'TextureView'
  >;
}

export default codegenNativeComponent<NativeProps>('ThorVGView');
