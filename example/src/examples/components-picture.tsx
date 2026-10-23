import { useEffect, useState } from 'react';
import { Canvas, Picture, Rect } from '@thorvg/react-native-thorvg';
import { loadBytes, loadText } from './assets';

const Example = () => {
  const [svg, setSvg] = useState<string>();
  const [png, setPng] = useState<Uint8Array>();

  useEffect(() => {
    loadText('/assets/svg/tiger.svg').then(setSvg);
    loadBytes('/assets/images/test.png').then(setPng);
  }, []);

  return (
    <Canvas width={600} height={600} style={{ width: '100%', aspectRatio: 1 }}>
      <Rect x={0} y={0} width={600} height={600} fill="#ffffff" />
      {svg && (
        <Picture
          data={svg}
          options={{ type: 'svg' }}
          size={{ width: 300, height: 300 }}
        />
      )}
      {png && (
        <Picture
          data={png}
          options={{ type: 'png' }}
          size={{ width: 260, height: 260 }}
          translate={{ x: 320, y: 320 }}
          rotate={-10}
          opacity={220}
        />
      )}
    </Canvas>
  );
};

export default Example;
