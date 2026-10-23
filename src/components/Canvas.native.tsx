import { useLayoutEffect, useRef, useState } from 'react';
import type { Canvas as CanvasInstance } from '@thorvg/webcanvas';
import ThorVGView from '../specs/ThorVGViewNativeComponent';
import { Canvas as NativeCanvas } from '../native/core/Canvas';
import type { CanvasProps } from '../types';
import { assignRef } from './assignRef';
import { useCanvasSize } from './useCanvasSize';

let nextSurfaceId = 1;

export function Canvas({
  ref,
  width,
  height,
  enableDevicePixelRatio,
  engineOption,
  androidBackingView,
  onLayout,
  ...rest
}: CanvasProps) {
  const [surfaceId] = useState(() => nextSurfaceId++);
  const [size, handleLayout] = useCanvasSize(width, height, onLayout);
  const canvasRef = useRef<NativeCanvas | null>(null);
  const latest = useRef({ ref, size });
  latest.current = { ref, size };

  useLayoutEffect(() => {
    const { ref: target, size: initial } = latest.current;
    const canvas = new NativeCanvas(surfaceId, {
      width: Math.max(1, initial.width),
      height: Math.max(1, initial.height),
      enableDevicePixelRatio,
      engineOption,
    });
    canvasRef.current = canvas;
    assignRef(target, canvas as unknown as CanvasInstance);
    return () => {
      assignRef(target, null);
      canvas.destroy();
      if (canvasRef.current === canvas) canvasRef.current = null;
    };
  }, [surfaceId, enableDevicePixelRatio, engineOption]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width <= 0 || size.height <= 0) return;
    canvas.resize(size.width, size.height).render();
  }, [size.width, size.height]);

  return (
    <ThorVGView
      {...rest}
      surfaceId={surfaceId}
      androidBackingView={androidBackingView}
      onLayout={handleLayout}
    />
  );
}
