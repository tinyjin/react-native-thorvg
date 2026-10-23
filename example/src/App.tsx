import { useEffect, useRef, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  useThorVG,
  type Canvas,
  type ThorVG,
} from '@thorvg/react-native-thorvg';
import dancingStar from './assets/dancing_star.json';

const WIDTH = 300;
const HEIGHT = 200;

const SVG = `<svg viewBox='0 0 104 97' xmlns='http://www.w3.org/2000/svg'>
  <path d='M14,85l3,9h72c0,0,5-9,4-10c-2-2-79,0-79,1' fill='#7C4E32'/>
  <path d='M19,47c0,0-9,7-13,14c-5,6,3,7,3,7l1,14c0,0,10,8,23,8c14,0,26,1,28,0c2-1,9-2,9-4c1-1,27,1,27-9c0-10,7-20-11-29c-17-9-67-1-67-1' fill='#E30000'/>
  <path d='M17,32c-3,48,80,43,71-3 l-35-15' fill='#FFE1C4'/>
  <path d="M17,32c9-36,61-32,71-3c-20-9-40-9-71,3" fill="#8ED8F8"/>
  <path d='M54,35a10 8 60 1 1 0,0.1zM37,38a10 8 -60 1 1 0,0.1z' fill='#FFF'/>
  <path d='M41,6c1-1,4-3,8-3c3-0,9-1,14,3l-1,2h-2h-2c0,0-3,1-5,0c-2-1-1-1-1-1l-3,1l-2-1h-1c0,0-1,2-3,2c0,0-2-1-2-3M17,34l0-2c0,0,35-20,71-3v2c0,0-35-17-71,3M5,62c3-2,5-2,8,0c3,2,13,6,8,11c-2,2-6,0-8,0c-1,1-4,2-6,1c-4-3-6-8-2-12M99,59c0,0-9-2-11,4l-3,5c0,1-2,3,3,3c5,0,5,2,7,2c3,0,7-1,7-4c0-4-1-11-3-10' fill='#FFF200'/>
  <path d='M56,78v1M55,69v1M55,87v1' stroke='#000' stroke-linecap='round'/>
  <path d='M60,36a1 1 0 1 1 0-0.1M49,36a1 1 0 1 1 0-0.1M57,55a2 3 0 1 1 0-0.1M12,94c0,0,20-4,42,0c0,0,27-4,39,0z'/>
  <path d='M50,59c0,0,4,3,10,0M56,66l2,12l-2,12M25,50c0,0,10,12,23,12c13,0,24,0,35-15' fill='none' stroke='#000' stroke-width='0.5'/>
</svg>`;

function ShapesDemo({ TVG }: { TVG: ThorVG }) {
  const canvas = useRef<Canvas>(null);

  useEffect(() => {
    const target = canvas.current;
    if (!target) return;

    const background = new TVG.Shape();
    const linear = new TVG.LinearGradient(0, 0, WIDTH, HEIGHT);
    linear.addStop(0, [37, 99, 235, 255]).addStop(1, [147, 51, 234, 255]);
    background.appendRect(0, 0, WIDTH, HEIGHT, { rx: 24, ry: 24 }).fill(linear);

    const sun = new TVG.Shape();
    const radial = new TVG.RadialGradient(70, 84, 64);
    radial.addStop(0, [255, 255, 255, 255]).addStop(1, [251, 191, 36, 255]);
    sun.appendCircle(80, 96, 48).fill(radial);

    const star = new TVG.Shape();
    const cx = 210;
    const cy = 96;
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? 56 : 24;
      const angle = (Math.PI / 5) * i - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) star.moveTo(x, y);
      else star.lineTo(x, y);
    }
    star
      .close()
      .fill(244, 63, 94, 255)
      .stroke({
        width: 4,
        color: [255, 255, 255, 255],
        dash: [10, 6],
        join: TVG.StrokeJoin.Round,
      });

    const label = new TVG.Text();
    label
      .font('default')
      .fontSize(26)
      .text('ThorVG')
      .fill(255, 255, 255)
      .translate(104, 156);

    target.add(background).add(sun).add(star).add(label).render();

    return () => {
      target.remove();
    };
  }, [TVG]);

  return (
    <TVG.Canvas
      ref={canvas}
      width={WIDTH}
      height={HEIGHT}
      style={styles.canvas}
    />
  );
}

function LottieDemo({ TVG }: { TVG: ThorVG }) {
  const canvas = useRef<Canvas>(null);

  useEffect(() => {
    const target = canvas.current;
    if (!target) return;

    const animation = new TVG.LottieAnimation();
    animation.load(JSON.stringify(dancingStar));
    const picture = animation.picture;
    if (!picture) return;

    picture.size(HEIGHT, HEIGHT).translate((WIDTH - HEIGHT) / 2, 0);
    target.add(picture);
    animation.play(() => target.update().render());

    return () => {
      animation.pause();
      target.remove();
      animation.dispose();
    };
  }, [TVG]);

  return (
    <TVG.Canvas
      ref={canvas}
      width={WIDTH}
      height={HEIGHT}
      style={styles.canvas}
    />
  );
}

function SvgDemo({ TVG }: { TVG: ThorVG }) {
  const canvas = useRef<Canvas>(null);

  useEffect(() => {
    const target = canvas.current;
    if (!target) return;

    const picture = new TVG.Picture();
    picture.load(SVG, { type: 'svg' });
    const { width, height } = picture.size();
    const scale = Math.min(WIDTH / width, HEIGHT / height);
    picture
      .size(width * scale, height * scale)
      .translate((WIDTH - width * scale) / 2, (HEIGHT - height * scale) / 2);
    target.add(picture).render();

    return () => {
      target.remove();
    };
  }, [TVG]);

  return (
    <TVG.Canvas
      ref={canvas}
      width={WIDTH}
      height={HEIGHT}
      style={styles.canvas}
    />
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function App() {
  const TVG = useThorVG({ renderer: 'sw' });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>ThorVG for React Native</Text>
      {TVG ? (
        <>
          <Section title="Shapes">
            <ShapesDemo TVG={TVG} />
          </Section>
          <Section title="Lottie">
            <LottieDemo TVG={TVG} />
          </Section>
          <Section title="SVG">
            <SvgDemo TVG={TVG} />
          </Section>
          <Text style={styles.footer}>ThorVG {TVG.version}</Text>
        </>
      ) : (
        <Text style={styles.footer}>Loading ThorVG…</Text>
      )}
      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 16,
    gap: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  section: {
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  canvas: {
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
  },
  footer: {
    color: '#64748B',
  },
});
