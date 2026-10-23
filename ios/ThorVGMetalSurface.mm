#import "ThorVGMetalSurface.h"

#import <Metal/Metal.h>
#if THORVG_RN_WEBGPU
#import <webgpu/webgpu.h>
#endif

#include <algorithm>
#include <array>
#include <cstring>

namespace thorvg::rn {

namespace {

constexpr size_t kFramesInFlight = 3;

#if THORVG_RN_WEBGPU
class WgGpu final : public Gpu {
 public:
  static WgGpu *shared()
  {
    static WgGpu *gpu = [] {
      auto *instance = new WgGpu();
      if (instance->init()) return instance;
      delete instance;
      return static_cast<WgGpu *>(nullptr);
    }();
    return gpu;
  }

  Renderer renderer() const override { return Renderer::Wg; }

  Tvg_Canvas create(Tvg_Engine_Option option) override { return tvg_wgcanvas_create(option); }

  void bind(Surface *) override {}

  WGPUSurface createSurface(CAMetalLayer *layer)
  {
    WGPUSurfaceSourceMetalLayer source = {};
    source.chain.sType = WGPUSType_SurfaceSourceMetalLayer;
    source.layer = (__bridge void *)layer;
    WGPUSurfaceDescriptor descriptor = {};
    descriptor.nextInChain = &source.chain;
    return wgpuInstanceCreateSurface(instance_, &descriptor);
  }

  Tvg_WgContext context() const { return {instance_, adapter_, device_}; }

 private:
  bool init()
  {
    instance_ = wgpuCreateInstance(nullptr);
    if (!instance_) return false;

    WGPURequestAdapterOptions adapterOptions = {};
    adapterOptions.powerPreference = WGPUPowerPreference_HighPerformance;
    WGPURequestAdapterCallbackInfo adapterCallback = {};
    adapterCallback.mode = WGPUCallbackMode_AllowSpontaneous;
    adapterCallback.callback = [](WGPURequestAdapterStatus status, WGPUAdapter adapter, WGPUStringView, void *out, void *) {
      if (status == WGPURequestAdapterStatus_Success) *static_cast<WGPUAdapter *>(out) = adapter;
    };
    adapterCallback.userdata1 = &adapter_;
    wgpuInstanceRequestAdapter(instance_, &adapterOptions, adapterCallback);
    if (!adapter_) return false;

    WGPUDeviceDescriptor deviceDescriptor = {};
    deviceDescriptor.uncapturedErrorCallbackInfo.callback = [](WGPUDevice const *, WGPUErrorType, WGPUStringView message,
                                                               void *, void *) {
      NSLog(@"[ThorVG] WebGPU error: %.*s", static_cast<int>(message.length), message.data);
    };
    WGPURequestDeviceCallbackInfo deviceCallback = {};
    deviceCallback.mode = WGPUCallbackMode_AllowSpontaneous;
    deviceCallback.callback = [](WGPURequestDeviceStatus status, WGPUDevice device, WGPUStringView, void *out, void *) {
      if (status == WGPURequestDeviceStatus_Success) *static_cast<WGPUDevice *>(out) = device;
    };
    deviceCallback.userdata1 = &device_;
    wgpuAdapterRequestDevice(adapter_, &deviceDescriptor, deviceCallback);
    return device_ != nullptr;
  }

  WGPUInstance instance_ = nullptr;
  WGPUAdapter adapter_ = nullptr;
  WGPUDevice device_ = nullptr;
};
#endif

class MetalSurface final : public Surface {
 public:
  explicit MetalSurface(CAMetalLayer *layer)
      : layer_(layer),
        queue_([layer.device newCommandQueue]),
        inflight_(dispatch_semaphore_create(kFramesInFlight)) {}

#if THORVG_RN_WEBGPU
  ~MetalSurface() override
  {
    if (wgSurface_) wgpuSurfaceRelease(wgSurface_);
  }

  Tvg_Result target(Tvg_Canvas canvas, uint32_t width, uint32_t height) override
  {
    auto *gpu = WgGpu::shared();
    if (!gpu) return TVG_RESULT_NOT_SUPPORTED;
    if (!wgSurface_) wgSurface_ = gpu->createSurface(layer_);
    if (!wgSurface_) return TVG_RESULT_INSUFFICIENT_CONDITION;
    auto context = gpu->context();
    return tvg_wgcanvas_set_target_with_context(canvas, &context, wgSurface_, width, height, TVG_COLORSPACE_ABGR8888, 0);
  }

  void swap() override
  {
    if (wgSurface_) wgpuSurfacePresent(wgSurface_);
  }
#endif

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
#if THORVG_RN_WEBGPU
  WGPUSurface wgSurface_ = nullptr;
#endif
};

}

Gpu *platformGpu()
{
#if THORVG_RN_WEBGPU
  return WgGpu::shared();
#else
  return nullptr;
#endif
}

std::shared_ptr<Surface> makeMetalSurface(CAMetalLayer *layer)
{
  return std::make_shared<MetalSurface>(layer);
}

}
