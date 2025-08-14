package com.example.chatbt.ui.screens

import android.graphics.Bitmap
import android.util.Base64
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.unit.dp
import com.example.chatbt.data.Store
import com.example.chatbt.qr.Qr

@Composable
fun MyQrScreen() {
    val ctx = LocalContext.current
    val profile = Store.loadProfile(ctx)
    if (profile == null) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Profile not set") }
        return
    }
    val bmp: Bitmap = remember { Qr.toBitmap(Qr.payload(profile), size = 640) }
    Column(Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
        Text("Show this to your friend to add you")
        Spacer(Modifier.height(12.dp))
        Image(bmp.asImageBitmap(), contentDescription = "My QR", modifier = Modifier.size(300.dp))
    }
}
