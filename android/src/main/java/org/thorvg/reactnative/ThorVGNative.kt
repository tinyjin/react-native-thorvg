package org.thorvg.reactnative

import android.view.Surface
import com.facebook.proguard.annotations.DoNotStrip

internal object ThorVGNative {
  @Volatile private var loaded = false

  @Synchronized
  fun load() {
    if (loaded) return
    System.loadLibrary("reactnativethorvg")
    loaded = true
  }
}

@DoNotStrip
internal object ThorVGSurfaces {
  init {
    ThorVGNative.load()
  }

  fun attach(surfaceId: Int, surface: Surface) = nativeAttach(surfaceId, surface)

  fun detach(surfaceId: Int) = nativeDetach(surfaceId)

  @JvmStatic @DoNotStrip private external fun nativeAttach(surfaceId: Int, surface: Surface)

  @JvmStatic @DoNotStrip private external fun nativeDetach(surfaceId: Int)
}
