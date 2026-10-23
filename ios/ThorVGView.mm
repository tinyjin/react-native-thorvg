#import "ThorVGView.h"

#import <Metal/Metal.h>
#import <QuartzCore/CAMetalLayer.h>

#import <react/renderer/components/ReactNativeThorVGSpec/ComponentDescriptors.h>
#import <react/renderer/components/ReactNativeThorVGSpec/Props.h>
#import <react/renderer/components/ReactNativeThorVGSpec/RCTComponentViewHelpers.h>

#include "ThorVGMetalSurface.h"
#include "ThorVGSurface.h"

using namespace facebook::react;

@interface ThorVGMetalView : UIView
@end

@implementation ThorVGMetalView

+ (Class)layerClass
{
  return [CAMetalLayer class];
}

@end

@implementation ThorVGView {
  ThorVGMetalView *_metalView;
  int _surfaceId;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<ThorVGViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const ThorVGViewProps>();
    _props = defaultProps;

    _metalView = [[ThorVGMetalView alloc] initWithFrame:self.bounds];
    _metalView.userInteractionEnabled = NO;
    _metalView.backgroundColor = UIColor.clearColor;

    CAMetalLayer *layer = (CAMetalLayer *)_metalView.layer;
    layer.device = MTLCreateSystemDefaultDevice();
    layer.pixelFormat = MTLPixelFormatBGRA8Unorm;
    layer.framebufferOnly = NO;
    layer.opaque = NO;

    self.contentView = _metalView;
  }
  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<ThorVGViewProps const>(props);
  if (newProps.surfaceId != _surfaceId) {
    [self detachSurface];
    _surfaceId = newProps.surfaceId;
    [self attachSurface];
  }
  [super updateProps:props oldProps:oldProps];
}

- (void)prepareForRecycle
{
  [self detachSurface];
  _surfaceId = 0;
  [super prepareForRecycle];
}

- (void)dealloc
{
  [self detachSurface];
}

- (void)attachSurface
{
  if (_surfaceId == 0) return;
  thorvg::rn::SurfaceRegistry::shared().attachSurface(_surfaceId,
                                                      thorvg::rn::makeMetalSurface((CAMetalLayer *)_metalView.layer));
}

- (void)detachSurface
{
  if (_surfaceId == 0) return;
  thorvg::rn::SurfaceRegistry::shared().detachSurface(_surfaceId);
}

@end
