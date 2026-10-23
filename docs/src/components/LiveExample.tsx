import { useEffect, useRef, useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './LiveExample.module.css';

export default function LiveExample({ id }: { id: string }) {
  const base = useBaseUrl('/examples/');
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(480);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === 'thorvg-embed') setHeight(event.data.height);
      if (event.data?.type === 'thorvg-open') {
        window.location.href = `${base}?example=${event.data.id}`;
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [base]);

  return (
    <iframe
      ref={frame}
      className={styles.frame}
      style={{ height }}
      src={`${base}?embed=${id}`}
      title={id}
      loading="lazy"
    />
  );
}
