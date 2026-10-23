#include "ThorVGTicker.h"

#import <QuartzCore/QuartzCore.h>

namespace {

std::function<void(double)> gTick;

}

@interface ThorVGTickerThread : NSThread
@property(nonatomic, strong) CADisplayLink *link;
@end

@implementation ThorVGTickerThread

- (void)main
{
  @autoreleasepool {
    self.link = [CADisplayLink displayLinkWithTarget:self selector:@selector(tick:)];
    self.link.paused = YES;
    [self.link addToRunLoop:[NSRunLoop currentRunLoop] forMode:NSRunLoopCommonModes];
    while (!self.cancelled) {
      @autoreleasepool {
        [[NSRunLoop currentRunLoop] runMode:NSDefaultRunLoopMode beforeDate:[NSDate distantFuture]];
      }
    }
  }
}

- (void)tick:(CADisplayLink *)link
{
  if (gTick) gTick(link.timestamp);
}

- (void)setActive:(NSNumber *)active
{
  self.link.paused = !active.boolValue;
}

@end

namespace thorvg::rn {

namespace {

ThorVGTickerThread *thread()
{
  static ThorVGTickerThread *shared = [] {
    auto *instance = [ThorVGTickerThread new];
    instance.name = @"ThorVG Render";
    instance.qualityOfService = NSQualityOfServiceUserInteractive;
    [instance start];
    return instance;
  }();
  return shared;
}

}

void setTicker(std::function<void(double)> tick)
{
  gTick = std::move(tick);
}

void setTickerActive(bool active)
{
  auto *ticker = thread();
  [ticker performSelector:@selector(setActive:) onThread:ticker withObject:@(active) waitUntilDone:NO];
}

}
