package org.thorvg.reactnative

import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.turbomodule.core.interfaces.BindingsInstallerHolder
import com.facebook.react.turbomodule.core.interfaces.TurboModuleWithJSIBindings

@ReactModule(name = ThorVGModule.NAME)
class ThorVGModule(reactContext: ReactApplicationContext) :
  NativeThorVGSpec(reactContext), TurboModuleWithJSIBindings {

  override fun install(): Boolean = true

  @DoNotStrip external override fun getBindingsInstaller(): BindingsInstallerHolder

  companion object {
    const val NAME = NativeThorVGSpec.NAME

    init {
      ThorVGNative.load()
    }
  }
}
