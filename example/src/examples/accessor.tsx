import { useEffect, useRef } from 'react';
import { useThorVG, type Canvas } from '@thorvg/react-native-thorvg';
import { loadText } from './assets';

const Example = () => {
  const TVG = useThorVG({ renderer: 'sw' });
  const canvasRef = useRef<Canvas>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!TVG || !canvas) return;
    let active = true;

    // Native example: Accessor.cpp

    // This example demonstrates two approaches to accessing internal SVG scene nodes.
    (async () => {
      // SVG Picture
      const svgString = await loadText('/assets/svg/favorite_on.svg');
      if (!active) return;

      const picture = new TVG.Picture();

      picture.accessible = true; // allow access to the SVG internals, it must be set before the SVG load call.
      picture.load(svgString, { type: 'svg' });
      picture.size(600, 600);

      /* 1. This demonstrates traversing the internal scene tree of the SVG picture. */
      const accessor = new TVG.Accessor();

      // If picture.accessible is set to true, only ID-accessible nodes are traversed,
      // which improves efficiency. Otherwise, all nodes are considered.
      accessor.set(picture, (paint) => {
        // figure out SVG node with the unique ID "star".
        if (accessor.name(paint.id) === 'star' && paint instanceof TVG.Shape) {
          // override color
          paint.fill(0, 0, 255);
        }

        // you can return false, to stop traversing immediately
        return true;
      });

      /* 2. This demonstrates a direct-access to the shape that corresponds to the SVG node with the unique ID "star". */
      const paint = picture.paint(TVG.Accessor.id('star'));
      if (paint instanceof TVG.Shape) {
        paint.stroke({ width: 5, color: [255, 255, 0, 255] });
      }

      canvas.add(picture);
      canvas.render();
    })();

    return () => {
      active = false;
    };
  }, [TVG]);

  if (!TVG) return null;
  return (
    <TVG.Canvas
      ref={canvasRef}
      width={600}
      height={600}
      style={{ width: '100%', aspectRatio: 1 }}
    />
  );
};

export default Example;
