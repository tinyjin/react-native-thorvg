# ThorVG for React Native

<p align="center">
  <img width="550" height="auto" src="https://github.com/thorvg/thorvg.site/blob/main/readme/logo/animated_brand.svg">
</p>

[ThorVG](https://github.com/thorvg/thorvg) vector graphics and Lottie for React Native on Android, iOS and web.

## Installation

```sh
npm install @thorvg/react-native-thorvg
```

## Usage

### Declarative API (Components)

Import the components and render them inside `Canvas`.

```tsx
import { Canvas, Rect } from '@thorvg/react-native-thorvg';

const Example = () => (
  <Canvas width={200} height={160}>
    <Rect x={20} y={20} width={160} height={120} rx={16} ry={16} fill="#2563eb" />
  </Canvas>
);
```

### WebCanvas API

Use the [`@thorvg/webcanvas`](https://www.npmjs.com/package/@thorvg/webcanvas) API directly with `useThorVG`.

```tsx
import { useEffect, useRef } from 'react';
import { Canvas, useThorVG } from '@thorvg/react-native-thorvg';

const Example = () => {
  const TVG = useThorVG({ renderer: 'sw' });
  const view = useRef<Canvas>(null);

  useEffect(() => {
    if (!TVG) return;
    const canvas = new TVG.Canvas(view, { width: 200, height: 160 });

    const shape = new TVG.Shape();
    shape.appendRect(20, 20, 160, 120, { rx: 16, ry: 16 }).fill(37, 99, 235, 255);
    canvas.add(shape).render();

    return () => canvas.destroy();
  }, [TVG]);

  return <Canvas ref={view} style={{ width: 200, height: 160 }} />;
}
```

## Requirements

- React Native with the New Architecture
- iOS 15.1+, Android API 24+

## Key Features

### Canvas
The Core API is compatible with [`@thorvg/webcanvas`](https://www.npmjs.com/package/@thorvg/webcanvas). On iOS and Android follow same classes run on the native ThorVG engine through [JSI](https://reactnative.dev/architecture/glossary#javascript-interfaces-jsi).

<p align="center">
  <img width="600" src="docs/static/img/architecture.svg" alt="react-native-thorvg architecture">
</p>

**Properties**

| Prop | Description |
| --- | --- |
| `androidBackingView` | `'TextureView'` (default) or `'SurfaceView'`. A `SurfaceView` composites on its own layer and does not blend with views behind it. |
| `ref` | Receives the view that `new TVG.Canvas(ref, options)` draws into. |

Note: Video playback and FontProvider aren't supported.

### Lottie animation

ThorVG provides a powerful Lottie playback runtime. You can run Lottie animations on a canvas without installing any additional packages.


```tsx
useEffect(() => {
  if (!TVG) return;
  const canvas = new TVG.Canvas(view, { width: 200, height: 200 });

  const animation = new TVG.LottieAnimation();
  animation.load(JSON.stringify(lottieJson));
  animation.picture!.size(200, 200);
  canvas.add(animation.picture!);
  animation.play(() => canvas.update().render());

  return () => {
    animation.dispose();
    canvas.destroy();
  };
}, [TVG]);
```

Note: Default Lottie audio playback is not available. Use `LottieAnimation.resolver()` to enable.

## Platform Notes

## Android

The JSI binding calls the ThorVG C API from `@thorvg/react-native-thorvg-core-android` and draws into the view's Android `Surface`.

- Canvases render into a `TextureView` by default.
- Android supports `'gl'` (OpenGL ES) and `'sw'`.

## iOS

The JSI binding calls the ThorVG C API from `@thorvg/react-native-thorvg-core-ios` and draws into the view's `CAMetalLayer`.

- Run `pod install` in your `ios` directory after installing the package.
- iOS supports `'wg'` (WebGPU on Metal) and `'sw'`.

## Web

Web platform uses `@thorvg/webcanvas`, which provides `thorvg.wasm` from default CDN. To serve it yourself, specify your own WASM URL:

```ts
useThorVG({ locateFile: (path) => 'https://example.com/path/to/' + path.split('/').pop() });
```

Note: `init()` options `locateFile` and `threads` only apply on web.

## Development
- Node 24.15+
- Yarn 4.18+


```sh
git submodule update --init
yarn
yarn build:thorvg            # prebuilt ThorVG into libs/ (needs meson, ninja, pkg-config, Xcode, Android NDK)
yarn example ios             # or: yarn example android, yarn example web
```
