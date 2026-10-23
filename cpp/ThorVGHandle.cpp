#include "ThorVGHandle.h"

namespace thorvg::rn {

Handle::~Handle() {
  if (!owned_ || !ptr_) return;
  switch (kind_) {
    case Kind::Paint:
      tvg_paint_unref(static_cast<Tvg_Paint>(ptr_), true);
      break;
    case Kind::Gradient:
      tvg_gradient_del(static_cast<Tvg_Gradient>(ptr_));
      break;
    case Kind::Animation:
      tvg_animation_del(static_cast<Tvg_Animation>(ptr_));
      break;
    case Kind::Accessor:
      tvg_accessor_del(static_cast<Tvg_Accessor>(ptr_));
      break;
  }
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
