import { useEffect, useState } from 'react';
import { Canvas, LottieAnimation, Rect } from '@thorvg/react-native-thorvg';
import { loadText } from './assets';

const Example = () => {
  const [data, setData] = useState<string>();

  useEffect(() => {
    loadText(
      '/assets/lottie/27746-joypixels-partying-face-emoji-animation.json'
    ).then(setData);
  }, []);

  return (
    <Canvas width={600} height={600} style={{ width: '100%', aspectRatio: 1 }}>
      <Rect x={0} y={0} width={600} height={600} fill="#f3f4f6" />
      {data && (
        <LottieAnimation
          data={data}
          size={{ width: 500, height: 500 }}
          translate={{ x: 50, y: 50 }}
          playing
          loop
        />
      )}
    </Canvas>
  );
};

export default Example;
