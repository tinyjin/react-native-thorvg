package org.thorvg.reactnative

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.views.view.ReactViewGroup
import com.facebook.react.views.view.ReactViewManager

@ReactModule(name = ThorVGViewManager.NAME)
class ThorVGViewManager : ReactViewManager() {
  override fun getName(): String = NAME

  override fun createViewInstance(context: ThemedReactContext): ThorVGView = ThorVGView(context)

  @ReactProp(name = "surfaceId")
  fun setSurfaceId(view: ThorVGView, value: Int) {
    view.setSurfaceId(value)
  }

  @ReactProp(name = "androidBackingView")
  fun setAndroidBackingView(view: ThorVGView, value: String?) {
    view.setBackingView(value)
  }

  override fun prepareToRecycleView(reactContext: ThemedReactContext, view: ReactViewGroup): ReactViewGroup? {
    (view as? ThorVGView)?.release()
    return null
  }

  override fun onDropViewInstance(view: ReactViewGroup) {
    (view as? ThorVGView)?.release()
    super.onDropViewInstance(view)
  }

  companion object {
    const val NAME = "ThorVGView"
  }
}
