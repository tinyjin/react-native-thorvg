import { useEffect, useRef } from 'react';
import { useThorVG, type Canvas } from '@thorvg/react-native-thorvg';

const Example = () => {
  const TVG = useThorVG({ renderer: 'sw' });
  const canvasRef = useRef<Canvas>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!TVG || !canvas) return;

    // Global error handling catches

    // Background
    const background = new TVG.Shape();
    background.appendRect(0, 0, 600, 600);
    background.fill(45, 45, 45);
    canvas.add(background);

    // Error: Invalid SVG data (ThorVGError - WASM error)
    const picture = new TVG.Picture();
    picture.load('invalid svg data', { type: 'svg' }); // Error caught by onError
    canvas.add(picture);

    // Visual indicator
    const errorIndicator = new TVG.Shape();
    errorIndicator.appendCircle(300, 300, 100, 100);
    errorIndicator.fill(255, 100, 100, 255);
    canvas.add(errorIndicator);

    // Info text
    const infoText = new TVG.Text();
    infoText.font('default');
    infoText.fontSize(16);
    infoText.text('Check console for error logs');
    infoText.fill(255, 255, 255);
    infoText.translate(150, 500);
    canvas.add(infoText);

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
