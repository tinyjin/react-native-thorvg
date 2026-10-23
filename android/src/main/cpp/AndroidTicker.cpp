#include "ThorVGTicker.h"

#include <android/choreographer.h>
#include <android/looper.h>

#include <atomic>
#include <mutex>
#include <thread>

namespace thorvg::rn {

namespace {

std::function<void(double)> gTick;
std::atomic<bool> gActive{false};
std::atomic<ALooper*> gLooper{nullptr};
bool gPosted = false;

void frame(long frameTimeNanos, void*);

void post() {
  if (gPosted || !gActive) return;
  gPosted = true;
  AChoreographer_postFrameCallback(AChoreographer_getInstance(), frame, nullptr);
}

void frame(long frameTimeNanos, void*) {
  gPosted = false;
  if (!gActive) return;
  if (gTick) gTick(static_cast<double>(frameTimeNanos) / 1e9);
  post();
}

void start() {
  static std::once_flag once;
  std::call_once(once, [] {
    std::thread([] {
      auto* looper = ALooper_prepare(0);
      ALooper_acquire(looper);
      gLooper = looper;
      while (true) {
        ALooper_pollOnce(-1, nullptr, nullptr, nullptr);
        post();
      }
    }).detach();
  });
  while (!gLooper) std::this_thread::yield();
}

}

void setTicker(std::function<void(double)> tick) {
  gTick = std::move(tick);
}

void setTickerActive(bool active) {
  gActive = active;
  if (!active) return;
  start();
  ALooper_wake(gLooper);
}

}
