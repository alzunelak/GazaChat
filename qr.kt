package com.example.chatbt.qr

import android.graphics.Bitmap
import com.example.chatbt.data.UserProfile
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.WriterException
import com.google.zxing.qrcode.QRCodeWriter
import org.json.JSONObject

object Qr {
    fun payload(profile: UserProfile): String {
        // Minimal JSON with username + publicKey
        return JSONObject().apply {
            put("u", profile.username)
            put("k", profile.publicKeyPem)
        }.toString()
    }

    fun toBitmap(text: String, size: Int = 512): Bitmap {
        val hints = mapOf(EncodeHintType.MARGIN to 1)
        val bitMatrix = QRCodeWriter().encode(text, BarcodeFormat.QR_CODE, size, size, hints)
        val bmp = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        for (x in 0 until size) for (y in 0 until size) {
            bmp.setPixel(x, y, if (bitMatrix[x, y]) 0xFF000000.toInt() else 0xFFFFFFFF.toInt())
        }
        return bmp
    }

    fun parse(text: String): Pair<String,String> {
        val o = JSONObject(text)
        return o.getString("u") to o.getString("k")
    }
}
