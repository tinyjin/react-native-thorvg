#include <ReactCommon/BindingsInstallerHolder.h>
#include <android/native_window.h>
#include <android/native_window_jni.h>
#include <fbjni/fbjni.h>
#include <jsi/jsi.h>

#include <algorithm>
#include <cstring>

#include "ThorVGBindings.h"
#include "ThorVGSurface.h"

namespace jni = facebook::jni;
namespace jsi = facebook::jsi;
namespace react = facebook::react;

namespace thorvg::rn {

namespace {

class AndroidSurface final : public Surface {
 public:
  explicit AndroidSurface(ANativeWindow* window) : window_(window) {}
  ~AndroidSurface() override { ANativeWindow_release(window_); }

  void present(const uint32_t* pixels, uint32_t width, uint32_t height) override {
    if (width != width_ || height != height_) {
      ANativeWindow_setBuffersGeometry(window_, static_cast<int32_t>(width), static_cast<int32_t>(height),
                                       WINDOW_FORMAT_RGBA_8888);
      width_ = width;
      height_ = height;
    }

    ANativeWindow_Buffer buffer;
    if (ANativeWindow_lock(window_, &buffer, nullptr) != 0) return;

    auto rows = std::min<uint32_t>(height, static_cast<uint32_t>(buffer.height));
    auto columns = std::min<uint32_t>(width, static_cast<uint32_t>(buffer.width));
    auto* dst = static_cast<uint8_t*>(buffer.bits);
    for (uint32_t y = 0; y < rows; ++y) {
      std::memcpy(dst + static_cast<size_t>(y) * buffer.stride * 4, pixels + static_cast<size_t>(y) * width,
                  columns * 4);
    }
    ANativeWindow_unlockAndPost(window_);
  }

 private:
  ANativeWindow* window_;
  uint32_t width_ = 0;
  uint32_t height_ = 0;
};

struct ThorVGModule : jni::JavaClass<ThorVGModule> {
  static constexpr auto kJavaDescriptor = "Lorg/thorvg/reactnative/ThorVGModule;";

  static void registerNatives() {
    javaClassLocal()->registerNatives({makeNativeMethod("getBindingsInstaller", ThorVGModule::getBindingsInstaller)});
  }

  static jni::local_ref<react::BindingsInstallerHolder::javaobject> getBindingsInstaller(
      jni::alias_ref<ThorVGModule>) {
    return react::BindingsInstallerHolder::newObjectCxxArgs(
        [](jsi::Runtime& runtime, const std::shared_ptr<react::CallInvoker>&) { install(runtime); });
  }
};

struct ThorVGSurfaces : jni::JavaClass<ThorVGSurfaces> {
  static constexpr auto kJavaDescriptor = "Lorg/thorvg/reactnative/ThorVGSurfaces;";

  static void registerNatives() {
    javaClassLocal()->registerNatives({
        makeNativeMethod("nativeAttach", "(ILandroid/view/Surface;)V", ThorVGSurfaces::attach),
        makeNativeMethod("nativeDetach", ThorVGSurfaces::detach),
    });
  }

  static void attach(jni::alias_ref<jclass>, jint surfaceId, jni::alias_ref<jobject> surface) {
    auto* window = ANativeWindow_fromSurface(jni::Environment::current(), surface.get());
    if (!window) return;
    SurfaceRegistry::shared().attachSurface(surfaceId, std::make_shared<AndroidSurface>(window));
  }

  static void detach(jni::alias_ref<jclass>, jint surfaceId) { SurfaceRegistry::shared().detachSurface(surfaceId); }
};

}

}

JNIEXPORT jint JNI_OnLoad(JavaVM* vm, void*) {
  return jni::initialize(vm, [] {
    thorvg::rn::ThorVGModule::registerNatives();
    thorvg::rn::ThorVGSurfaces::registerNatives();
  });
}
