import { createElement, useCallback, useLayoutEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import type { CanvasViewProps } from '../types';
import { assignRef } from './assignRef';
import { CanvasTarget } from './CanvasTarget';

export function CanvasView({
  ref,
  androidBackingView: _androidBackingView,
  onLayout,
  style,
  ...rest
}: CanvasViewProps) {
  const [surface] = useState(() => new CanvasTarget(0));

  useLayoutEffect(() => {
    assignRef(ref, surface);
    return () => assignRef(ref, null);
  }, [ref, surface]);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      surface.layout(width, height);
      onLayout?.(event);
    },
    [surface, onLayout]
  );

  const setElement = useCallback(
    (element: unknown) => {
      surface.element = element;
    },
    [surface]
  );

  return (
    <View {...rest} style={[styles.container, style]} onLayout={handleLayout}>
      {createElement('canvas', {
        ref: setElement,
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
