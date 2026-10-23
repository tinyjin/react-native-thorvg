import { createElement, useLayoutEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas as WebCanvas } from '@thorvg/webcanvas';
import type { CanvasProps } from '../types';
import { assignRef } from './assignRef';
import { useCanvasSize } from './useCanvasSize';

type CanvasElement = ConstructorParameters<typeof WebCanvas>[0];

export function Canvas({
  ref,
  width,
  height,
  enableDevicePixelRatio,
  engineOption,
  androidBackingView: _androidBackingView,
  onLayout,
  style,
  ...rest
}: CanvasProps) {
  const [size, handleLayout] = useCanvasSize(width, height, onLayout);
  const elementRef = useRef<CanvasElement | null>(null);
  const canvasRef = useRef<WebCanvas | null>(null);
  const latest = useRef({ ref, size });
  latest.current = { ref, size };

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const { ref: target, size: initial } = latest.current;
    const canvas = new WebCanvas(element, {
      width: Math.max(1, initial.width),
      height: Math.max(1, initial.height),
      enableDevicePixelRatio,
      engineOption,
    });
    canvasRef.current = canvas;
    assignRef(target, canvas);
    return () => {
      assignRef(target, null);
      canvas.destroy();
      if (canvasRef.current === canvas) canvasRef.current = null;
    };
  }, [enableDevicePixelRatio, engineOption]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width <= 0 || size.height <= 0) return;
    canvas.resize(size.width, size.height).render();
  }, [size.width, size.height]);

  return (
    <View {...rest} style={[styles.container, style]} onLayout={handleLayout}>
      {createElement('canvas', {
        ref: elementRef,
        style: { display: 'block' },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
