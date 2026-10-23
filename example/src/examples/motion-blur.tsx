import { useEffect, useRef } from 'react';
import {
  useThorVG,
  type Canvas,
  type Shape,
} from '@thorvg/react-native-thorvg';

const Example = () => {
  const TVG = useThorVG({ renderer: 'sw' });
  const canvasRef = useRef<Canvas>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!TVG || !canvas) return;
    let active = true;
    let rafId = 0;

    // Native example: MotionBlur.cpp

    const circles: Shape[] = [];

    const radius = 600 * 0.1;
    const distance = { x: 600 - 2 * radius, y: 600 - 2 * radius };

    // horizontal
    {
      circles[0] = new TVG.Shape();
      circles[0].appendCircle(radius, radius, radius, radius);
      circles[0].fill(255, 255, 0);

      // motion blur effect scene
      const scene = new TVG.Scene();
      // distance, angle, quality
      scene.motionBlur(distance.x * 0.1, 0, 100);
      scene.add(circles[0]);
      canvas.add(scene);
    }

    // vertical
    {
      circles[1] = new TVG.Shape();
      circles[1].appendCircle(600 * 0.5, radius, radius, radius);
      circles[1].fill(0, 255, 255);

      // motion blur effect scene
      const scene = new TVG.Scene();
      scene.motionBlur(distance.y * 0.1, 90, 100);
      scene.add(circles[1]);
      canvas.add(scene);
    }

    // diagonal
    {
      circles[2] = new TVG.Shape();
      circles[2].appendCircle(600 - radius, 600 - radius, radius, radius);
      circles[2].fill(255, 0, 255);

      // motion blur effect scene
      const scene = new TVG.Scene();
      const dist = Math.hypot(distance.x, distance.y) * 0.1;
      const angle = (Math.atan2(distance.y, distance.x) * 180) / Math.PI;
      scene.motionBlur(dist, angle, 100);

      scene.add(circles[2]);
      canvas.add(scene);
    }

    canvas.render();

    // Animation loop
    let startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const duration = 1000; // 1 second
      let progress = (elapsed % duration) / duration;
      if (Math.floor(elapsed / duration) % 2 !== 0) progress = 1 - progress; // rewind

      circles[0].translate(distance.x * progress, 0);
      circles[1].translate(0, distance.y * progress);
      circles[2].translate(-distance.x * progress, -distance.y * progress);

      canvas.update();
      canvas.render();

      if (active) rafId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      active = false;
      cancelAnimationFrame(rafId);
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
