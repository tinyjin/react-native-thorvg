import { DeclarativeCanvas } from '../components/DeclarativeCanvas';
import type { CanvasProps } from '../types';
import type { CanvasTarget } from './CanvasTarget';
import { CanvasView } from './CanvasView';

export type Canvas = CanvasTarget;

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
      style={style}
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
