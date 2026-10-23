import NativeThorVG from './specs/NativeThorVG';
import { setGlobalErrorHandler } from './native/errors';
import { getJSI } from './native/jsi';
import * as constants from './native/generated/constants';
import { Accessor } from './native/core/Accessor';
import { Animation } from './native/core/Animation';
import { Canvas, setRenderer } from './native/core/Canvas';
import { ConicGradient } from './native/core/ConicGradient';
import { Font } from './native/core/Font';
import { LinearGradient } from './native/core/LinearGradient';
import { LottieAnimation } from './native/core/LottieAnimation';
import { Paint } from './native/core/Paint';
import { Picture } from './native/core/Picture';
import { RadialGradient } from './native/core/RadialGradient';
import { Scene } from './native/core/Scene';
import { Shape } from './native/core/Shape';
import { Text } from './native/core/Text';
import type { InitOptions, ThorVG } from './types';

export { ThorVGError, ThorVGResultCode } from './native/errors';

export async function createNamespace(
  options: InitOptions,
  onTerm: () => void
): Promise<ThorVG> {
  if (!globalThis.__thorvg && !NativeThorVG.install()) {
    throw new Error('ThorVG native bindings are not available');
  }

  getJSI().engine_init(options.threads ?? 0);
  setGlobalErrorHandler(options.onError);
  setRenderer(options.renderer);

  const namespace = {
    Paint,
    Canvas,
    Shape,
    Scene,
    Picture,
    Text,
    Animation,
    LottieAnimation,
    LinearGradient,
    RadialGradient,
    ConicGradient,
    Font,
    Accessor,
    BlendMethod: constants.BlendMethod,
    StrokeCap: constants.StrokeCap,
    StrokeJoin: constants.StrokeJoin,
    FillRule: constants.FillRule,
    PathCommand: constants.PathCommand,
    GradientSpread: constants.GradientSpread,
    MaskMethod: constants.MaskMethod,
    SceneEffect: constants.SceneEffect,
    TextWrapMode: constants.TextWrapMode,
    ColorSpace: constants.ColorSpace,
    FilterMethod: constants.FilterMethod,
    EngineOption: constants.EngineOption,
    version: getJSI().version,
    term: () => {
      setGlobalErrorHandler(undefined);
      onTerm();
    },
  } satisfies Record<keyof ThorVG, unknown>;

  return namespace as unknown as ThorVG;
}
