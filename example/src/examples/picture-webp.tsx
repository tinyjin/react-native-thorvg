import { useEffect, useRef } from 'react';
import { useThorVG, type Canvas } from '@thorvg/react-native-thorvg';
import { loadBytes } from './assets';

const Example = () => {
  const TVG = useThorVG({ renderer: 'sw' });
  const canvasRef = useRef<Canvas>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!TVG || !canvas) return;
    let active = true;

    // Native example: PictureWebp.cpp

    //Background
    const bg = new TVG.Shape();
    bg.appendRect(0, 0, 600, 600); //x, y, w, h
    bg.fill(255, 255, 255); //r, g, b
    canvas.add(bg);

    //Load webp file
    (async () => {
      const data = await loadBytes('/assets/images/test.webp');
      if (!active) return;

      for (let i = 0; i < 7; ++i) {
        const picture = new TVG.Picture();
        picture.load(data, { type: 'webp' });
        picture.translate(i * 97.5, i * 97.5);
        picture.rotate(30 * i);
        picture.size(130, 130);
        picture.opacity(31 * (1 + i));
        canvas.add(picture);
      }

      //Open file
      {
        const picture = new TVG.Picture();
        picture.load(data, { type: 'webp' });

        picture.translate(260, 0);
        picture.scale(0.65);
        canvas.add(picture);
      }

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
