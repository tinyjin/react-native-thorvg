#import "ThorVGMetalSurface.h"

#import <Metal/Metal.h>

#include <algorithm>
#include <array>
#include <cstring>

namespace thorvg::rn {

namespace {

constexpr size_t kFramesInFlight = 3;

class MetalSurface final : public Surface {
 public:
  explicit MetalSurface(CAMetalLayer *layer)
      : layer_(layer),
        queue_([layer.device newCommandQueue]),
        inflight_(dispatch_semaphore_create(kFramesInFlight)) {}

  void present(const uint32_t *pixels, uint32_t width, uint32_t height) override
  {
    @autoreleasepool {
      if (!queue_) return;

      CGSize size = CGSizeMake(width, height);
      if (!CGSizeEqualToSize(layer_.drawableSize, size)) {
        [CATransaction begin];
        [CATransaction setDisableActions:YES];
        layer_.drawableSize = size;
        [CATransaction commit];
      }

      dispatch_semaphore_wait(inflight_, DISPATCH_TIME_FOREVER);

      NSUInteger length = static_cast<NSUInteger>(width) * height * 4;
      id<MTLBuffer> buffer = buffers_[index_];
      if (!buffer || buffer.length < length) {
        buffer = [layer_.device newBufferWithLength:length options:MTLResourceStorageModeShared];
        buffers_[index_] = buffer;
      }
      index_ = (index_ + 1) % kFramesInFlight;
      std::memcpy(buffer.contents, pixels, length);

      id<CAMetalDrawable> drawable = [layer_ nextDrawable];
      if (!drawable) {
        dispatch_semaphore_signal(inflight_);
        return;
      }

      NSUInteger copyWidth = std::min<NSUInteger>(width, drawable.texture.width);
      NSUInteger copyHeight = std::min<NSUInteger>(height, drawable.texture.height);

      id<MTLCommandBuffer> commands = [queue_ commandBuffer];
      id<MTLBlitCommandEncoder> blit = [commands blitCommandEncoder];
      [blit copyFromBuffer:buffer
                 sourceOffset:0
            sourceBytesPerRow:width * 4
          sourceBytesPerImage:length
                   sourceSize:MTLSizeMake(copyWidth, copyHeight, 1)
                    toTexture:drawable.texture
             destinationSlice:0
             destinationLevel:0
            destinationOrigin:MTLOriginMake(0, 0, 0)];
      [blit endEncoding];
      [commands presentDrawable:drawable];

      dispatch_semaphore_t inflight = inflight_;
      [commands addCompletedHandler:^(id<MTLCommandBuffer>) {
        dispatch_semaphore_signal(inflight);
      }];
      [commands commit];
    }
  }

 private:
  CAMetalLayer *layer_;
  id<MTLCommandQueue> queue_;
  dispatch_semaphore_t inflight_;
  std::array<id<MTLBuffer>, kFramesInFlight> buffers_{};
  size_t index_ = 0;
};

}

Gpu *platformGpu()
{
  return nullptr;
}

std::shared_ptr<Surface> makeMetalSurface(CAMetalLayer *layer)
{
  return std::make_shared<MetalSurface>(layer);
}

}
