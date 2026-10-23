#pragma once

#include <cstdint>
#include <memory>
#include <mutex>
#include <unordered_map>
#include <vector>

#include "thorvg_capi.h"

namespace thorvg::rn {

class Surface {
 public:
  virtual ~Surface() = default;
  virtual void present(const uint32_t* pixels, uint32_t width, uint32_t height) = 0;
};

class CanvasHost {
 public:
  CanvasHost(int surfaceId, Tvg_Engine_Option option);
  ~CanvasHost();

  CanvasHost(const CanvasHost&) = delete;
  CanvasHost& operator=(const CanvasHost&) = delete;

  int surfaceId() const { return surfaceId_; }
  bool valid() const { return canvas_ != nullptr; }

  Tvg_Result resize(uint32_t width, uint32_t height);
  Tvg_Result render();
  Tvg_Result add(Tvg_Paint paint);
  Tvg_Result remove(Tvg_Paint paint);
  Tvg_Result update();
  Tvg_Result viewport(int32_t x, int32_t y, int32_t w, int32_t h);

  void attach(std::shared_ptr<Surface> surface);
  void detach();

 private:
  void presentLocked();

  std::mutex mutex_;
  Tvg_Canvas canvas_ = nullptr;
  std::vector<uint32_t> buffer_;
  uint32_t width_ = 0;
  uint32_t height_ = 0;
  bool drawn_ = false;
  std::shared_ptr<Surface> surface_;
  int surfaceId_;
};

class SurfaceRegistry {
 public:
  static SurfaceRegistry& shared();

  void attachSurface(int surfaceId, std::shared_ptr<Surface> surface);
  void detachSurface(int surfaceId);
  void bindCanvas(int surfaceId, const std::shared_ptr<CanvasHost>& canvas);
  void unbindCanvas(int surfaceId, const CanvasHost* canvas);

 private:
  struct Entry {
    std::shared_ptr<Surface> surface;
    std::weak_ptr<CanvasHost> canvas;
  };

  void prune(int surfaceId);

  std::mutex mutex_;
  std::unordered_map<int, Entry> entries_;
};

}
