#import "ThorVGModule.h"

#import <ReactCommon/RCTTurboModuleWithJSIBindings.h>

#include "ThorVGBindings.h"

@interface ThorVGModule () <RCTTurboModuleWithJSIBindings>
@end

@implementation ThorVGModule

RCT_EXPORT_MODULE(ThorVG)

- (NSNumber *)install
{
  return @YES;
}

- (void)installJSIBindingsWithRuntime:(facebook::jsi::Runtime &)runtime
                          callInvoker:(const std::shared_ptr<facebook::react::CallInvoker> &)callInvoker
{
  thorvg::rn::install(runtime);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeThorVGSpecJSI>(params);
}

@end
