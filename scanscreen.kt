package com.example.chatbt.ui.screens

import android.annotation.SuppressLint
import android.util.Size
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.example.chatbt.data.Friend
import com.example.chatbt.data.Store
import com.example.chatbt.qr.Qr
import com.google.zxing.*
import com.google.zxing.common.HybridBinarizer
import java.nio.ByteBuffer
import java.util.concurrent.Executors

@Composable
fun ScanScreen(onFriendReady:()->Unit) {
    val ctx = LocalContext.current
    var decoded by remember { mutableStateOf<Pair<String,String>?>(null) }

    Column(Modifier.fillMaxSize().padding(12.dp)) {
        Text("Scan your friend’s QR")
        Spacer(Modifier.height(8.dp))
        CameraPreview { yBuffer, uBuffer, vBuffer, width, height ->
            // Very simple luminance-only decode using Y plane
            val y = yBuffer.toByteArray()
            val source = PlanarYUVLuminanceSource(y, width, height, 0, 0, width, height, false)
            val bitmap = BinaryBitmap(HybridBinarizer(source))
            try {
                val result = MultiFormatReader().decode(bitmap)
                val (username, pubKeyPem) = Qr.parse(result.text)
                if (decoded == null) {
                    decoded = username to pubKeyPem
                    Store.saveFriend(ctx, Friend(username = username, publicKeyPem = pubKeyPem))
                    onFriendReady()
                }
            } catch (_: Exception) {}
        }
    }
}

@SuppressLint("UnsafeOptInUsageError")
@Composable
private fun CameraPreview(onFrame:(ByteBuffer, ByteBuffer?, ByteBuffer?, Int, Int)->Unit) {
    val ctx = LocalContext.current
    val cameraProviderFuture = remember { ProcessCameraProvider.getInstance(ctx) }
    AndroidView(factory = { context ->
        val previewView = PreviewView(context)
        val executor = Executors.newSingleThreadExecutor()
        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()
            val preview = androidx.camera.core.Preview.Builder().build().also {
                it.setSurfaceProvider(previewView.surfaceProvider)
            }
            val analysis = ImageAnalysis.Builder()
                .setTargetResolution(Size(640,480))
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build().also {
                    it.setAnalyzer(executor) { image: ImageProxy ->
                        val planes = image.planes
                        val y = planes[0].buffer
                        val u = planes.getOrNull(1)?.buffer
                        val v = planes.getOrNull(2)?.buffer
                        onFrame(y, u, v, image.width, image.height)
                        image.close()
                    }
                }
            val selector = androidx.camera.core.CameraSelector.DEFAULT_BACK_CAMERA
            cameraProvider.unbindAll()
            cameraProvider.bindToLifecycle(context as androidx.lifecycle.LifecycleOwner, selector, preview, analysis)
        }, ContextCompat.getMainExecutor(context))
        previewView
    }, modifier = Modifier.fillMaxWidth().height(360.dp))
}

private fun ByteBuffer.toByteArray(): ByteArray {
    rewind()
    val b = ByteArray(remaining())
    get(b)
    return b
}
