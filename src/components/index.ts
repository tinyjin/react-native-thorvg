import type { ReactNode, Ref } from 'react';
import type {
  Animation as WebAnimation,
  ConicGradient as WebConicGradient,
  Font as WebFont,
  LinearGradient as WebLinearGradient,
  LottieAnimation as WebLottieAnimation,
  Picture as WebPicture,
  RadialGradient as WebRadialGradient,
  Scene as WebScene,
  Shape as WebShape,
  Text as WebText,
} from '@thorvg/webcanvas';
import type {
  AnimationProps,
  CircleProps,
  ClipProps,
  ConicGradientProps,
  FontProps,
  LinearGradientProps,
  LottieAnimationProps,
  MaskProps,
  PathProps,
  PictureProps,
  RadialGradientProps,
  RectProps,
  SceneProps,
  TextProps,
} from './props';
import { HostType } from './reconciler';

type Component<P, I = never> = (props: P & { ref?: Ref<I> }) => ReactNode;

function host<P, I = never>(type: string): Component<P, I> {
  return type as unknown as Component<P, I>;
}

export const Rect = host<RectProps, WebShape>(HostType.Rect);

export const Circle = host<CircleProps, WebShape>(HostType.Circle);

export const Path = host<PathProps, WebShape>(HostType.Path);

export const Scene = host<SceneProps, WebScene>(HostType.Scene);
export type Scene = WebScene;

export const Picture = host<PictureProps, WebPicture>(HostType.Picture);
export type Picture = WebPicture;

export const Text = host<TextProps, WebText>(HostType.Text);
export type Text = WebText;

export const Animation = host<AnimationProps, WebAnimation>(HostType.Animation);
export type Animation = WebAnimation;

export const LottieAnimation = host<LottieAnimationProps, WebLottieAnimation>(
  HostType.LottieAnimation
);
export type LottieAnimation = WebLottieAnimation;

export const LinearGradient = host<LinearGradientProps>(
  HostType.LinearGradient
);
export type LinearGradient = WebLinearGradient;

export const RadialGradient = host<RadialGradientProps>(
  HostType.RadialGradient
);
export type RadialGradient = WebRadialGradient;

export const ConicGradient = host<ConicGradientProps>(HostType.ConicGradient);
export type ConicGradient = WebConicGradient;

export const Clip = host<ClipProps>(HostType.Clip);

export const Mask = host<MaskProps>(HostType.Mask);

export const Font = host<FontProps>(HostType.Font);
export type Font = WebFont;
