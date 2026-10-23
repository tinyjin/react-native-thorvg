import { Image } from 'react-native';

export interface UriSource {
  uri: string;
  headers?: Record<string, string>;
}

export type LottieSource = number | UriSource | string | object;

export type SvgSource = number | UriSource | string;

const cache = new Map<string, Promise<string>>();

function fetchText(source: UriSource): Promise<string> {
  const key = source.headers
    ? `${source.uri}\n${JSON.stringify(source.headers)}`
    : source.uri;
  let request = cache.get(key);
  if (!request) {
    request = fetch(source.uri, { headers: source.headers }).then((res) => {
      if (!res.ok) throw new Error(`${res.status} ${source.uri}`);
      return res.text();
    });
    request.catch(() => cache.delete(key));
    cache.set(key, request);
  }
  return request;
}

export function loadSource(source: LottieSource | SvgSource): Promise<string> {
  if (typeof source === 'number') {
    const asset = Image.resolveAssetSource(source);
    if (!asset?.uri) {
      return Promise.reject(new Error('ThorVG: unresolved asset source'));
    }
    return fetchText({ uri: asset.uri });
  }
  if (typeof source === 'string') return Promise.resolve(source);
  if ('uri' in source && typeof source.uri === 'string') {
    return fetchText(source as UriSource);
  }
  return Promise.resolve(JSON.stringify(source));
}

export function sourceKey(source: LottieSource | SvgSource): unknown {
  if (source && typeof source === 'object' && 'uri' in source) {
    const uri = source as UriSource;
    return `${uri.uri}\n${JSON.stringify(uri.headers ?? null)}`;
  }
  return source;
}
