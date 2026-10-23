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

    // Native example: Picture.cpp

    (async () => {
      //The default font for fallback in case
      const fontData = await loadBytes('/fonts/PublicSans-Regular.ttf');
      if (!active) return;
      TVG.Font.load('PublicSans-Regular', fontData, { type: 'ttf' });

      //Background
      const bg = new TVG.Shape();
      bg.appendRect(0, 0, 600, 600);
      bg.fill(50, 50, 50);
      canvas.add(bg);

      const picture = new TVG.Picture();
      picture.origin(0.5, 0.5); //center origin

      const data = await loadText('/assets/svg/logo.svg');
      if (!active) return;
      picture.load(data, { type: 'svg' });

      //image scaling preserving its aspect ratio
      const { width: w2, height: h2 } = picture.size();
      const scale = w2 > h2 ? 600 / w2 : 600 / h2;
      picture.scale(scale);
      picture.translate(300, 300);

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
