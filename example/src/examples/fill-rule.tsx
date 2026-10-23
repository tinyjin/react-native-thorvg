import { useEffect, useRef } from 'react';
import { useThorVG, type Canvas } from '@thorvg/react-native-thorvg';

const Example = () => {
  const TVG = useThorVG({ renderer: 'sw' });
  const canvasRef = useRef<Canvas>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!TVG || !canvas) return;

    // Native example: FillRule.cpp

    //Star
    const star1 = new TVG.Shape();
    star1.moveTo(153.75, 30);
    star1.lineTo(247.5, 304.29);
    star1.lineTo(18.75, 128.57);
    star1.lineTo(288.75, 128.57);
    star1.lineTo(60, 304.29);
    star1.close();
    star1.fill(255, 255, 255, 255);
    star1.fillRule(TVG.FillRule.Winding);

    //Star 2
    const star2 = new TVG.Shape();
    star2.moveTo(401.25, 287.14);
    star2.lineTo(495, 561.43);
    star2.lineTo(266.25, 385.71);
    star2.lineTo(536.25, 385.71);
    star2.lineTo(307.5, 561.43);
    star2.close();
    star2.fill(255, 255, 255, 255);
    star2.fillRule(TVG.FillRule.EvenOdd);

    canvas.add(star1);
    canvas.add(star2);
    canvas.render();
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
