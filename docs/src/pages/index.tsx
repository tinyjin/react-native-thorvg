import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const snippet = `import { useEffect, useRef } from 'react';
import { useThorVG, type Canvas } from '@thorvg/react-native-thorvg';

const Example = () => {
  const TVG = useThorVG({ renderer: 'sw' });
  const canvas = useRef<Canvas>(null);

  useEffect(() => {
    if (!TVG || !canvas.current) return;

    const shape = new TVG.Shape();
    shape.appendRect(20, 20, 160, 120, { rx: 16, ry: 16 }).fill(37, 99, 235, 255);
    canvas.current.add(shape).render();
  }, [TVG]);

  if (!TVG) return null;
  return <TVG.Canvas ref={canvas} style={{ width: 200, height: 160 }} />;
};`;

const features = [
  {
    title: 'One API on every platform',
    body: 'The @thorvg/webcanvas API runs on Android, iOS and web. Web uses WebCanvas itself, native runs the same classes on ThorVG through JSI.',
  },
  {
    title: 'Vector, Lottie, SVG and text',
    body: 'Shapes, gradients, masks, scene effects, Lottie animations with slots and markers, SVG, PNG, JPG and WebP pictures, and TrueType or OpenType text.',
  },
  {
    title: 'Copy and run',
    body: '55 examples ported from the WebCanvas playground. Each one is a complete component with its source one tap away.',
  },
];

export default function Home() {
  return (
    <Layout description="ThorVG vector graphics and Lottie for React Native">
      <header className={styles.hero}>
        <div className="container">
          <Heading as="h1" className={styles.title}>
            ThorVG for React Native
          </Heading>
          <p className={styles.tagline}>
            High-performance vector graphics rendering and Lottie on Android,
            iOS and web.
          </p>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to="/docs/getting-started">
              Get started
            </Link>
            <Link className="button button--secondary button--lg" to="/docs/examples">
              Examples
            </Link>
          </div>
          <div className={styles.snippet}>
            <CodeBlock language="tsx">{snippet}</CodeBlock>
          </div>
        </div>
      </header>
      <main className="container">
        <div className={styles.features}>
          {features.map((feature) => (
            <div key={feature.title} className={styles.feature}>
              <Heading as="h3">{feature.title}</Heading>
              <p>{feature.body}</p>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
}
