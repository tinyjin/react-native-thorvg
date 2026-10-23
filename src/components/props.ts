import type { ReactNode } from 'react';
import type { Color } from '../color';
import type {
  AnimationSegment,
  AssetResolver,
  AudioResolver,
  ColorStop,
  constants,
  LoadDataOptions,
  LottieSlotData,
  Matrix,
  PictureSize,
  TextLayout,
} from '@thorvg/webcanvas';

type BlendMethod = constants.BlendMethod;
type FillRule = constants.FillRule;
type FilterMethod = constants.FilterMethod;
type GradientSpread = constants.GradientSpread;
type MaskMethod = constants.MaskMethod;
type PathCommand = constants.PathCommand;
type StrokeCap = constants.StrokeCap;
type StrokeJoin = constants.StrokeJoin;
type TextWrapMode = constants.TextWrapMode;

export interface PaintProps {
  translate?: { x: number; y: number };
  rotate?: number;
  scale?: number;
  transform?: Matrix;
  opacity?: number;
  visible?: boolean;
  blend?: BlendMethod;
  children?: ReactNode;
}

export interface StrokeProps {
  width?: number;
  color?: Color;
  cap?: StrokeCap;
  join?: StrokeJoin;
  miterLimit?: number;
  dash?: number[];
  dashOffset?: number;
}

export interface TrimPath {
  begin: number;
  end: number;
  simultaneous?: boolean;
}

export interface ShapeProps extends PaintProps {
  fill?: Color;
  fillRule?: FillRule;
  stroke?: number | StrokeProps;
  trimPath?: TrimPath;
  order?: boolean;
}

export interface RectProps extends ShapeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
  ry?: number;
  clockwise?: boolean;
}

export interface CircleProps extends ShapeProps {
  cx: number;
  cy: number;
  rx: number;
  ry?: number;
  clockwise?: boolean;
}

export interface PathProps extends ShapeProps {
  commands: readonly PathCommand[];
  points: ReadonlyArray<readonly number[]>;
}

export type Effect =
  | {
      type: 'gaussianBlur';
      sigma: number;
      direction?: number;
      border?: number;
      quality?: number;
    }
  | { type: 'motionBlur'; distance: number; angle?: number; quality?: number }
  | {
      type: 'dropShadow';
      color: Color;
      angle: number;
      distance: number;
      sigma: number;
      quality?: number;
    }
  | { type: 'fill'; color: Color }
  | { type: 'tint'; black: Color; white: Color; intensity: number }
  | {
      type: 'tritone';
      shadow: Color;
      midtone: Color;
      highlight: Color;
      blend: number;
    };

export interface SceneProps extends PaintProps {
  effects?: readonly Effect[];
}

export interface PictureProps extends PaintProps {
  data?: Uint8Array | string;
  options?: LoadDataOptions;
  size?: PictureSize;
  origin?: { x: number; y: number };
  filter?: FilterMethod;
  accessible?: boolean;
  resolver?: AssetResolver;
}

export interface TextProps extends PaintProps {
  text?: string;
  font?: string;
  fontSize?: number;
  fill?: Color;
  align?: { x: number; y: number };
  layout?: TextLayout;
  wrap?: TextWrapMode;
  spacing?: { letter: number; line: number };
  italic?: boolean | number;
  outline?: { width: number; color: Color };
}

export interface AnimationProps extends PaintProps {
  data?: Uint8Array | string;
  size?: PictureSize;
  playing?: boolean;
  loop?: boolean;
  frame?: number;
  segment?: AnimationSegment;
  onFrame?: (frame: number) => void;
}

export interface LottieAnimationProps extends Omit<AnimationProps, 'segment'> {
  segment?: AnimationSegment | string;
  quality?: number;
  volume?: number;
  slot?: LottieSlotData | string;
  resolver?: AudioResolver;
}

export interface GradientProps {
  stops?: ReadonlyArray<readonly [number, ColorStop]>;
  spread?: GradientSpread;
  stroke?: boolean;
}

export interface LinearGradientProps extends GradientProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface RadialGradientProps extends GradientProps {
  cx: number;
  cy: number;
  r: number;
  fx?: number;
  fy?: number;
  fr?: number;
}

export interface ConicGradientProps extends GradientProps {
  cx: number;
  cy: number;
  angle?: number;
}

export interface ClipProps {
  children?: ReactNode;
}

export interface MaskProps {
  method: MaskMethod;
  children?: ReactNode;
}

export interface FontProps {
  name: string;
  data: Uint8Array;
  type?: 'ttf' | 'otf';
}
