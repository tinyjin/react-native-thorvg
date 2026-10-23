import { useCallback, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

interface Size {
  width: number;
  height: number;
}

export function useCanvasSize(
  width: number | undefined,
  height: number | undefined,
  onLayout: ((event: LayoutChangeEvent) => void) | undefined
): [Size, (event: LayoutChangeEvent) => void] {
  const [layout, setLayout] = useState<Size | null>(null);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const next = event.nativeEvent.layout;
      setLayout((prev) =>
        prev && prev.width === next.width && prev.height === next.height
          ? prev
          : { width: next.width, height: next.height }
      );
      onLayout?.(event);
    },
    [onLayout]
  );

  return [
    {
      width: width ?? layout?.width ?? 0,
      height: height ?? layout?.height ?? 0,
    },
    handleLayout,
  ];
}
