import type * as WebCanvas from '@thorvg/webcanvas';
import type { Accessor } from '../native/core/Accessor';
import type { Animation } from '../native/core/Animation';
import type { Canvas } from '../native/core/Canvas';
import type { ConicGradient } from '../native/core/ConicGradient';
import type { Font } from '../native/core/Font';
import type { LinearGradient } from '../native/core/LinearGradient';
import type { LottieAnimation } from '../native/core/LottieAnimation';
import type { Picture } from '../native/core/Picture';
import type { RadialGradient } from '../native/core/RadialGradient';
import type { Scene } from '../native/core/Scene';
import type { Shape } from '../native/core/Shape';
import type { Text } from '../native/core/Text';

type Missing<Web, Native> = Exclude<keyof Web, keyof Native>;
type Expect<T extends never> = T;

export type Parity = [
  Expect<Missing<WebCanvas.Shape, Shape>>,
  Expect<Missing<WebCanvas.Scene, Scene>>,
  Expect<Missing<WebCanvas.Picture, Picture>>,
  Expect<Missing<WebCanvas.Text, Text>>,
  Expect<Missing<WebCanvas.Animation, Animation>>,
  Expect<Missing<WebCanvas.LottieAnimation, LottieAnimation>>,
  Expect<Missing<WebCanvas.LinearGradient, LinearGradient>>,
  Expect<Missing<WebCanvas.RadialGradient, RadialGradient>>,
  Expect<Missing<WebCanvas.ConicGradient, ConicGradient>>,
  Expect<Missing<WebCanvas.Accessor, Accessor>>,
  Expect<Missing<WebCanvas.Canvas, Canvas>>,
  Expect<Missing<typeof WebCanvas.Font, typeof Font>>,
  Expect<Missing<typeof WebCanvas.Accessor, typeof Accessor>>,
];
