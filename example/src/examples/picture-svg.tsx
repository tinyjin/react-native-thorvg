import { useEffect, useRef } from 'react';
import { useThorVG, type Canvas } from '@thorvg/react-native-thorvg';
import { loadBytes, loadText } from './assets';

const Example = () => {
  const TVG = useThorVG({ renderer: 'sw' });
  const canvasRef = useRef<Canvas>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!TVG || !canvas) return;
    let active = true;

    // Native example: PictureSvg.cpp

    (async () => {
      //The default font for fallback in case
      const fontData = await loadBytes('/fonts/PublicSans-Regular.ttf');
      if (!active) return;
      TVG.Font.load('PublicSans-Regular', fontData, { type: 'ttf' });

      const data = await loadText('/assets/svg/logo.svg');
      if (!active) return;

      const opacity = 36;

      //Load svg file
      for (let i = 0; i < 7; ++i) {
        const picture = new TVG.Picture();
        picture.load(data, { type: 'svg' });
        picture.translate(i * 112.5, i * 112.5);
        picture.rotate(30 * i);
        picture.size(150, 150);
        picture.opacity(opacity + opacity * i);
        canvas.add(picture);
      }

      //Open file
      const picture = new TVG.Picture();
      picture.load(data, { type: 'svg' });

      picture.translate(300, 0);
      picture.scale(0.3);
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
