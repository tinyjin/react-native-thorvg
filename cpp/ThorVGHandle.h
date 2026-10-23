#pragma once

#include <jsi/jsi.h>

#include <functional>

#include "thorvg_capi.h"

namespace thorvg::rn {

namespace jsi = facebook::jsi;

class Handle : public jsi::NativeState {
 public:
  enum class Kind { Paint, Gradient, Animation, Accessor };

  Handle(void* ptr, Kind kind, bool owned) : ptr_(ptr), kind_(kind), owned_(owned) {}
  ~Handle() override;

  Handle(const Handle&) = delete;
  Handle& operator=(const Handle&) = delete;

  void* ptr() const { return ptr_; }
  Kind kind() const { return kind_; }
  void disown() { owned_ = false; }

 private:
  void* ptr_;
  Kind kind_;
  bool owned_;
};

void deferRelease(std::function<void()> release);
void drainReleases();

jsi::Value makeHandle(jsi::Runtime& rt, void* ptr, Handle::Kind kind, bool owned);
Handle* findHandle(jsi::Runtime& rt, const jsi::Value& value);

template <typename T>
T handlePtr(jsi::Runtime& rt, const jsi::Value& value) {
  auto handle = findHandle(rt, value);
  return handle ? static_cast<T>(handle->ptr()) : nullptr;
}

}
