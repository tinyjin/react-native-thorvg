#include "ThorVGHandle.h"

#include <atomic>
#include <mutex>
#include <utility>
#include <vector>

namespace thorvg::rn {

namespace {

std::mutex gReleaseMutex;
std::vector<std::function<void()>> gReleases;
std::atomic<bool> gHasReleases{false};

void release(void* ptr, Handle::Kind kind) {
  switch (kind) {
    case Handle::Kind::Paint:
      tvg_paint_unref(static_cast<Tvg_Paint>(ptr), true);
      break;
    case Handle::Kind::Gradient:
      tvg_gradient_del(static_cast<Tvg_Gradient>(ptr));
      break;
    case Handle::Kind::Animation:
      tvg_animation_del(static_cast<Tvg_Animation>(ptr));
      break;
    case Handle::Kind::Accessor:
      tvg_accessor_del(static_cast<Tvg_Accessor>(ptr));
      break;
  }
}

}

void deferRelease(std::function<void()> task) {
  std::lock_guard<std::mutex> lock(gReleaseMutex);
  gReleases.push_back(std::move(task));
  gHasReleases.store(true, std::memory_order_release);
}

void drainReleases() {
  if (!gHasReleases.load(std::memory_order_acquire)) return;
  std::vector<std::function<void()>> tasks;
  {
    std::lock_guard<std::mutex> lock(gReleaseMutex);
    tasks.swap(gReleases);
    gHasReleases.store(false, std::memory_order_release);
  }
  for (auto& task : tasks) task();
}

Handle::~Handle() {
  if (!owned_ || !ptr_) return;
  deferRelease([ptr = ptr_, kind = kind_] { release(ptr, kind); });
}

jsi::Value makeHandle(jsi::Runtime& rt, void* ptr, Handle::Kind kind, bool owned) {
  if (!ptr) return jsi::Value::null();
  jsi::Object object(rt);
  object.setNativeState(rt, std::make_shared<Handle>(ptr, kind, owned));
  return object;
}

Handle* findHandle(jsi::Runtime& rt, const jsi::Value& value) {
  if (!value.isObject()) return nullptr;
  auto object = value.getObject(rt);
  if (!object.hasNativeState<Handle>(rt)) {
    throw jsi::JSError(rt, "ThorVG: expected a native handle");
  }
  return object.getNativeState<Handle>(rt).get();
}

}
