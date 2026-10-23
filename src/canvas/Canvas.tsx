import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { DeclarativeCanvas } from '../components/DeclarativeCanvas';
import type { CanvasProps } from '../types';
import type { CanvasTarget } from './CanvasTarget';
import { CanvasView } from './CanvasView';

export type Canvas = CanvasTarget;

function sized(style: StyleProp<ViewStyle>): boolean {
  const flat = StyleSheet.flatten(style) ?? {};
  return (
    flat.width !== undefined ||
    flat.height !== undefined ||
    flat.aspectRatio !== undefined ||
    flat.flex !== undefined
  );
}

export function Canvas({
  children,
  width,
  height,
  enableDevicePixelRatio,
  engineOption,
  viewport,
  style,
  ...rest
}: CanvasProps) {
  if (children === undefined || children === null || children === false) {
    return <CanvasView {...rest} style={style} />;
  }
  return (
    <DeclarativeCanvas
      {...rest}
      style={sized(style) ? style : [{ width, height }, style]}
      width={width}
      height={height}
      enableDevicePixelRatio={enableDevicePixelRatio}
      engineOption={engineOption}
      viewport={viewport}
    >
      {children}
    </DeclarativeCanvas>
  );
}
