import { useCallback, useLayoutEffect, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import ThorVGView from '../specs/ThorVGViewNativeComponent';
import type { CanvasProps } from '../types';
import { assignRef } from './assignRef';
import { CanvasTarget } from './CanvasTarget';

export type Canvas = CanvasTarget;

let nextSurfaceId = 1;

export function Canvas({
  ref,
  androidBackingView,
  onLayout,
  ...rest
}: CanvasProps) {
  const [surface] = useState(() => new CanvasTarget(nextSurfaceId++));

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

  return (
    <ThorVGView
      {...rest}
      surfaceId={surface.surfaceId}
      androidBackingView={androidBackingView}
      onLayout={handleLayout}
    />
  );
}
