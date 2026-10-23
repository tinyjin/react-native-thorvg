#include "ThorVGSurface.h"

#include <algorithm>

namespace thorvg::rn {

#if defined(__APPLE__)
static constexpr Tvg_Colorspace kColorspace = TVG_COLORSPACE_ARGB8888;
#else
static constexpr Tvg_Colorspace kColorspace = TVG_COLORSPACE_ABGR8888;
#endif

namespace {

std::mutex gSchedulerMutex;
std::function<void(std::function<void()>)> gScheduler;

}

const char* rendererName(Renderer renderer) {
  switch (renderer) {
    case Renderer::Gl:
      return "gl";
    case Renderer::Wg:
      return "wg";
    default:
      return "sw";
  }
}

Renderer rendererFromName(const std::string& name) {
  if (name == "gl") return Renderer::Gl;
  if (name == "wg") return Renderer::Wg;
  return Renderer::Sw;
}

void setScheduler(std::function<void(std::function<void()>)> scheduler) {
  std::lock_guard<std::mutex> lock(gSchedulerMutex);
  gScheduler = std::move(scheduler);
}

CanvasHost::CanvasHost(int surfaceId, Tvg_Engine_Option option, Renderer renderer) : surfaceId_(surfaceId) {
  auto* gpu = renderer == Renderer::Sw ? nullptr : platformGpu();
  if (gpu && gpu->renderer() == renderer) {
    gpu->bind(nullptr);
    canvas_ = gpu->create(option);
    if (canvas_) gpu_ = gpu;
  }
  if (!canvas_) canvas_ = tvg_swcanvas_create(option);
}

CanvasHost::~CanvasHost() {
  std::lock_guard<std::mutex> lock(mutex_);
  if (canvas_) {
    if (gpu_) gpu_->bind(surface_.get());
    tvg_canvas_sync(canvas_);
    tvg_canvas_destroy(canvas_);
    canvas_ = nullptr;
  }
  surface_.reset();
}

Tvg_Result CanvasHost::resize(uint32_t width, uint32_t height) {
  std::lock_guard<std::mutex> lock(mutex_);
  if (!canvas_) return TVG_RESULT_INSUFFICIENT_CONDITION;
  width = std::max(width, 1u);
  height = std::max(height, 1u);
  if (width == width_ && height == height_) return TVG_RESULT_SUCCESS;

  width_ = width;
  height_ = height;
  if (gpu_) {
    targeted_ = false;
    return TVG_RESULT_SUCCESS;
  }

  tvg_canvas_sync(canvas_);
  buffer_.assign(static_cast<size_t>(width) * height, 0);
  drawn_ = false;
  return tvg_swcanvas_set_target(canvas_, buffer_.data(), width, width, height, kColorspace);
}

Tvg_Result CanvasHost::render() {
  std::lock_guard<std::mutex> lock(mutex_);
  if (!canvas_) return TVG_RESULT_INSUFFICIENT_CONDITION;

  if (gpu_) {
    drawn_ = true;
    if (!bindLocked()) return TVG_RESULT_SUCCESS;
    tvg_canvas_update(canvas_);
    auto result = tvg_canvas_draw(canvas_, true);
    tvg_canvas_sync(canvas_);
    surface_->swap();
    return result;
  }

  if (buffer_.empty()) return TVG_RESULT_INSUFFICIENT_CONDITION;
  auto result = tvg_canvas_draw(canvas_, true);
  tvg_canvas_sync(canvas_);
  drawn_ = true;
  presentLocked();
  return result;
}

Tvg_Result CanvasHost::add(Tvg_Paint paint) {
  std::lock_guard<std::mutex> lock(mutex_);
  if (!canvas_) return TVG_RESULT_INSUFFICIENT_CONDITION;
  bindLocked();
  return tvg_canvas_add(canvas_, paint);
}

Tvg_Result CanvasHost::remove(Tvg_Paint paint) {
  std::lock_guard<std::mutex> lock(mutex_);
  if (!canvas_) return TVG_RESULT_INSUFFICIENT_CONDITION;
  bindLocked();
  return tvg_canvas_remove(canvas_, paint);
}

Tvg_Result CanvasHost::update() {
  std::lock_guard<std::mutex> lock(mutex_);
  if (!canvas_) return TVG_RESULT_INSUFFICIENT_CONDITION;
  if (gpu_ && !bindLocked()) return TVG_RESULT_SUCCESS;
  return tvg_canvas_update(canvas_);
}

Tvg_Result CanvasHost::viewport(int32_t x, int32_t y, int32_t w, int32_t h) {
  std::lock_guard<std::mutex> lock(mutex_);
  if (!canvas_) return TVG_RESULT_INSUFFICIENT_CONDITION;
  bindLocked();
  return tvg_canvas_set_viewport(canvas_, x, y, w, h);
}

void CanvasHost::attach(std::shared_ptr<Surface> surface) {
  std::lock_guard<std::mutex> lock(mutex_);
  surface_ = std::move(surface);
  if (!gpu_) {
    presentLocked();
    return;
  }

  targeted_ = false;
  if (!drawn_) return;
  std::lock_guard<std::mutex> scheduler(gSchedulerMutex);
  if (gScheduler) {
    gScheduler([weak = weak_from_this()] {
      if (auto host = weak.lock()) host->render();
    });
  }
}

void CanvasHost::detach() {
  std::lock_guard<std::mutex> lock(mutex_);
  surface_.reset();
  targeted_ = false;
}

void CanvasHost::presentLocked() {
  if (surface_ && drawn_ && !buffer_.empty()) {
    surface_->present(buffer_.data(), width_, height_);
  }
}

bool CanvasHost::bindLocked() {
  if (!gpu_) return true;
  gpu_->bind(surface_.get());
  if (!surface_ || width_ == 0 || height_ == 0) return false;
  if (!targeted_) {
    tvg_canvas_sync(canvas_);
    targeted_ = surface_->target(canvas_, width_, height_) == TVG_RESULT_SUCCESS;
  }
  return targeted_;
}

SurfaceRegistry& SurfaceRegistry::shared() {
  static SurfaceRegistry registry;
  return registry;
}

void SurfaceRegistry::attachSurface(int surfaceId, std::shared_ptr<Surface> surface) {
  std::lock_guard<std::mutex> lock(mutex_);
  auto& entry = entries_[surfaceId];
  entry.surface = std::move(surface);
  if (auto canvas = entry.canvas.lock()) canvas->attach(entry.surface);
}

void SurfaceRegistry::detachSurface(int surfaceId) {
  std::lock_guard<std::mutex> lock(mutex_);
  auto it = entries_.find(surfaceId);
  if (it == entries_.end()) return;
  if (auto canvas = it->second.canvas.lock()) canvas->detach();
  it->second.surface.reset();
  prune(surfaceId);
}

void SurfaceRegistry::bindCanvas(int surfaceId, const std::shared_ptr<CanvasHost>& canvas) {
  std::lock_guard<std::mutex> lock(mutex_);
  auto& entry = entries_[surfaceId];
  entry.canvas = canvas;
  if (entry.surface) canvas->attach(entry.surface);
}

void SurfaceRegistry::unbindCanvas(int surfaceId, const CanvasHost* canvas) {
  std::lock_guard<std::mutex> lock(mutex_);
  auto it = entries_.find(surfaceId);
  if (it == entries_.end()) return;
  auto current = it->second.canvas.lock();
  if (current && current.get() != canvas) return;
  it->second.canvas.reset();
  prune(surfaceId);
}

void SurfaceRegistry::prune(int surfaceId) {
  auto it = entries_.find(surfaceId);
  if (it != entries_.end() && !it->second.surface && it->second.canvas.expired()) {
    entries_.erase(it);
  }
}

}
