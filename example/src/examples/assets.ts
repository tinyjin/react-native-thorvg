export const ASSETS =
  'https://raw.githubusercontent.com/thorvg/thorvg.web/main/apps/playground/public';

const fetchAsset = globalThis.fetch;

globalThis.fetch = (input, init) =>
  fetchAsset(
    typeof input === 'string' && input.startsWith('/') ? ASSETS + input : input,
    init
  );
