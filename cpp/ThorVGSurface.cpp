#include "ThorVGSurface.h"

#include <algorithm>

namespace thorvg::rn {

#if defined(__APPLE__)
static constexpr Tvg_Colorspace kColorspace = TVG_COLORSPACE_ARGB8888;
#else
static constexpr Tvg_Colorspace kColorspace = TVG_COLORSPACE_ABGR8888;
#endif

CanvasHost::CanvasHost(int surfaceId, Tvg_Engine_Option option)
    : canvas_(tvg_swcanvas_create(option)), surfaceId_(surfaceId) {}

CanvasHost::~CanvasHost() {
  std::lock_guard<std::mutex> lock(mutex_);
  if (canvas_) {
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

  tvg_canvas_sync(canvas_);
  buffer_.assign(static_cast<size_t>(width) * height, 0);
  width_ = width;
  height_ = height;
  drawn_ = false;
  return tvg_swcanvas_set_target(canvas_, buffer_.data(), width, width, height, kColorspace);
}

Tvg_Result CanvasHost::render() {
  std::lock_guard<std::mutex> lock(mutex_);
  if (!canvas_ || buffer_.empty()) return TVG_RESULT_INSUFFICIENT_CONDITION;
  auto result = tvg_canvas_draw(canvas_, true);
  tvg_canvas_sync(canvas_);
  drawn_ = true;
  presentLocked();
  return result;
}

Tvg_Result CanvasHost::add(Tvg_Paint paint) {
  std::lock_guard<std::mutex> lock(mutex_);
  return canvas_ ? tvg_canvas_add(canvas_, paint) : TVG_RESULT_INSUFFICIENT_CONDITION;
}

Tvg_Result CanvasHost::remove(Tvg_Paint paint) {
  std::lock_guard<std::mutex> lock(mutex_);
  return canvas_ ? tvg_canvas_remove(canvas_, paint) : TVG_RESULT_INSUFFICIENT_CONDITION;
}

Tvg_Result CanvasHost::update() {
  std::lock_guard<std::mutex> lock(mutex_);
  return canvas_ ? tvg_canvas_update(canvas_) : TVG_RESULT_INSUFFICIENT_CONDITION;
}

Tvg_Result CanvasHost::viewport(int32_t x, int32_t y, int32_t w, int32_t h) {
  std::lock_guard<std::mutex> lock(mutex_);
  return canvas_ ? tvg_canvas_set_viewport(canvas_, x, y, w, h) : TVG_RESULT_INSUFFICIENT_CONDITION;
}

void CanvasHost::attach(std::shared_ptr<Surface> surface) {
  std::lock_guard<std::mutex> lock(mutex_);
  surface_ = std::move(surface);
  presentLocked();
}

void CanvasHost::detach() {
  std::lock_guard<std::mutex> lock(mutex_);
  surface_.reset();
}

void CanvasHost::presentLocked() {
  if (surface_ && drawn_ && !buffer_.empty()) {
    surface_->present(buffer_.data(), width_, height_);
  }
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
