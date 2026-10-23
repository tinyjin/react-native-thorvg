#pragma once

#include <ReactCommon/CallInvoker.h>
#include <jsi/jsi.h>

#include <memory>

namespace thorvg::rn {

void install(facebook::jsi::Runtime& rt, std::shared_ptr<facebook::react::CallInvoker> callInvoker);

}
