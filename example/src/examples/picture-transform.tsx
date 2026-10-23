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
    let rafId = 0;

    // Native example: PictureTransform.cpp

    (async () => {
      const data = await loadBytes('/assets/images/scale.jpg');
      if (!active) return;

      //Original
      const picture = new TVG.Picture();
      picture.load(data, { type: 'jpg' });

      picture.origin(0.5, 0.5); //center origin
      picture.translate(300, 300);
      picture.scale(0.879);

      canvas.add(picture);

      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const duration = 3000; // play time 3 secs.
        let progress = (elapsed % duration) / duration;
        if (Math.floor(elapsed / duration) % 2 !== 0) progress = 1 - progress; // rewind

        picture.scale((1.0 - progress) * 0.879);
        picture.rotate(360 * progress);

        canvas.update();
        canvas.render();

        if (active) rafId = requestAnimationFrame(animate);
      };

      animate();
    })();

    return () => {
      active = false;
      cancelAnimationFrame(rafId);
      canvas.destroy();
    };
  }, [TVG]);

  if (!TVG) return null;
  return <Canvas ref={canvasRef} style={{ width: '100%', aspectRatio: 1 }} />;
};

export default Example;
