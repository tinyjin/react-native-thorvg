import type { ReactNode } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './ExamplesFrame.module.css';

export default function ExamplesFrame({
  example,
  children,
}: {
  example?: string;
  children?: ReactNode;
}) {
  const base = useBaseUrl('/examples/');
  const src = example ? `${base}?example=${example}` : base;

  return (
    <div className={styles.layout}>
      <div className={styles.content}>{children}</div>
      <div className={styles.preview}>
        <iframe className={styles.frame} src={src} title="ThorVG for React Native examples" />
        <a className={styles.open} href={src} target="_blank" rel="noreferrer">
          Open in a new tab
        </a>
      </div>
    </div>
  );
}
