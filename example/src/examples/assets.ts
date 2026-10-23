export const ASSETS =
  'https://raw.githubusercontent.com/thorvg/thorvg.web/main/apps/playground/public';

const cache = new Map<string, Promise<Uint8Array>>();

export function loadBytes(path: string): Promise<Uint8Array> {
  let data = cache.get(path);
  if (!data) {
    data = fetch(ASSETS + path)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${path}`);
        return res.arrayBuffer();
      })
      .then((buffer) => new Uint8Array(buffer));
    data.catch(() => cache.delete(path));
    cache.set(path, data);
  }
  return data;
}

export async function loadText(path: string): Promise<string> {
  const res = await fetch(ASSETS + path);
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.text();
}
