import { useEffect, useRef } from 'react';
import { Canvas, useThorVG } from '@thorvg/react-native-thorvg';
import { loadBytes } from './assets';

const Example = () => {
  const TVG = useThorVG({ renderer: 'sw' });
  const canvasRef = useRef<Canvas>(null);

  useEffect(() => {
    if (!TVG) return;
    const canvas = new TVG.Canvas(canvasRef, { width: 600, height: 600 });
    let active = true;

    // Native example: PictureRaw.cpp

    //Background
    const bg = new TVG.Shape();
    bg.appendRect(0, 0, 600, 600);
    bg.fill(255, 255, 255);
    canvas.add(bg);

    //Load raw image data (200x300, ARGB8888)
    (async () => {
      const data = await loadBytes('/assets/images/rawimage_200x300.raw');
      if (!active) return;

      //Picture 1: Simple display
      const picture = new TVG.Picture();
      picture.load(data, {
        type: 'raw',
        width: 200,
        height: 300,
        colorSpace: TVG.ColorSpace.ARGB8888,
      });
      picture.translate(260, 162.5);
      canvas.add(picture);

      //Picture 2: Rotated, scaled, with opacity and clipping
      const picture2 = new TVG.Picture();
      picture2.load(data, {
        type: 'raw',
        width: 200,
        height: 300,
        colorSpace: TVG.ColorSpace.ARGB8888,
      });

      picture2.translate(260, 130);
      picture2.rotate(47);
      picture2.scale(0.975);
      picture2.opacity(128);

      //Create circular clipping mask
      const circle = new TVG.Shape();
      circle.appendCircle(227.5, 227.5, 130, 130);
      picture2.clip(circle);

      canvas.add(picture2);

      canvas.render();
    })();

    return () => {
      active = false;
      canvas.destroy();
    };
  }, [TVG]);

  if (!TVG) return null;
  return <Canvas ref={canvasRef} style={{ width: '100%', aspectRatio: 1 }} />;
};

export default Example;
