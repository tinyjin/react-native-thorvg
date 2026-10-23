package org.thorvg.reactnative

import android.content.Context
import android.graphics.PixelFormat
import android.graphics.SurfaceTexture
import android.view.Surface
import android.view.SurfaceHolder
import android.view.SurfaceView
import android.view.TextureView
import android.view.View
import com.facebook.react.views.view.ReactViewGroup

class ThorVGView(context: Context) : ReactViewGroup(context) {
  private var surfaceId = 0
  private var backingView = BackingView.TEXTURE_VIEW
  private var renderView: View? = null
  private var surface: Surface? = null
  private var ownsSurface = false
  private var attached = false

  init {
    rebuild()
  }

  fun setSurfaceId(value: Int) {
    if (value == surfaceId) return
    detachSurface()
    surfaceId = value
    attachSurface()
  }

  fun setBackingView(value: String?) {
    val kind = if (value == "SurfaceView") BackingView.SURFACE_VIEW else BackingView.TEXTURE_VIEW
    if (kind == backingView) return
    backingView = kind
    rebuild()
  }

  fun release() {
    detachSurface()
    releaseSurface()
    surfaceId = 0
  }

  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
    val width = right - left
    val height = bottom - top
    renderView?.let {
      it.measure(
        MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
        MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
      )
      it.layout(0, 0, width, height)
    }
  }

  private fun rebuild() {
    detachSurface()
    releaseSurface()
    renderView?.let { removeView(it) }
    renderView = when (backingView) {
      BackingView.TEXTURE_VIEW -> createTextureView()
      BackingView.SURFACE_VIEW -> createSurfaceView()
    }.also { addView(it) }
    requestLayout()
  }

  private fun createTextureView(): TextureView =
    TextureView(context).apply {
      isOpaque = false
      surfaceTextureListener = object : TextureView.SurfaceTextureListener {
        override fun onSurfaceTextureAvailable(texture: SurfaceTexture, width: Int, height: Int) {
          setSurface(Surface(texture), owned = true)
        }

        override fun onSurfaceTextureSizeChanged(texture: SurfaceTexture, width: Int, height: Int) = Unit

        override fun onSurfaceTextureDestroyed(texture: SurfaceTexture): Boolean {
          detachSurface()
          releaseSurface()
          return true
        }

        override fun onSurfaceTextureUpdated(texture: SurfaceTexture) = Unit
      }
    }

  private fun createSurfaceView(): SurfaceView =
    SurfaceView(context).apply {
      holder.setFormat(PixelFormat.TRANSLUCENT)
      holder.addCallback(object : SurfaceHolder.Callback {
        override fun surfaceCreated(holder: SurfaceHolder) {
          setSurface(holder.surface, owned = false)
        }

        override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) = Unit

        override fun surfaceDestroyed(holder: SurfaceHolder) {
          detachSurface()
          releaseSurface()
        }
      })
    }

  private fun setSurface(value: Surface, owned: Boolean) {
    detachSurface()
    releaseSurface()
    surface = value
    ownsSurface = owned
    attachSurface()
  }

  private fun attachSurface() {
    val current = surface ?: return
    if (surfaceId == 0 || attached || !current.isValid) return
    ThorVGSurfaces.attach(surfaceId, current)
    attached = true
  }

  private fun detachSurface() {
    if (!attached) return
    ThorVGSurfaces.detach(surfaceId)
    attached = false
  }

  private fun releaseSurface() {
    if (ownsSurface) surface?.release()
    surface = null
    ownsSurface = false
  }

  private enum class BackingView { TEXTURE_VIEW, SURFACE_VIEW }
}
