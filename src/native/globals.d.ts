declare var performance: { now(): number };

declare class TextEncoder {
  encode(input?: string): Uint8Array;
}
