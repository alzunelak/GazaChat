package com.example.chatbt.ui.screens

import android.graphics.BitmapFactory
import android.util.Base64
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import com.example.chatbt.crypto.Crypto
import com.example.chatbt.data.Store
import com.example.chatbt.data.UserProfile
import java.io.InputStream

@Composable
fun NameScreen(onDone: () -> Unit) {
    var name by remember { mutableStateOf(TextFieldValue("")) }
    var photoBase64 by remember { mutableStateOf<String?>(null) }

    val pick = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) {
            val ctx = LocalContext.current
            val bytes = ctx.contentResolver.openInputStream(uri)!!.use(InputStream::readBytes)
            photoBase64 = Base64.encodeToString(bytes, Base64.NO_WRAP)
        }
    }

    Column(Modifier.fillMaxSize().padding(20.dp), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
        Box(Modifier.size(120.dp).clip(CircleShape).background(MaterialTheme.colorScheme.surfaceVariant).clickable { pick.launch("image/*") }, contentAlignment = Alignment.Center) {
            if (photoBase64 != null) {
                val bmp = BitmapFactory.decodeByteArray(Base64.decode(photoBase64, Base64.NO_WRAP), 0, Base64.decode(photoBase64, Base64.NO_WRAP).size)
                Image(bmp.asImageBitmap(), contentDescription = "photo", modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
            } else {
                Text("👤")
            }
        }
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Your name") }, singleLine = true)
        Spacer(Modifier.height(12.dp))
        Button(onClick = {
    if (name.text.isBlank()) return@Button

    // Ensure EC key in keystore
    val kp = com.example.chatbt.crypto.CryptoKeystore.ensureKey()
    val pubPem = com.example.chatbt.crypto.Crypto.publicKeyToPem(kp.public)

    val profile = com.example.chatbt.data.UserProfile(
        username = name.text.trim(),
        publicKeyPem = pubPem,
        photoBase64 = photoBase64
    )
    com.example.chatbt.data.Store.saveProfile(LocalContext.current, profile)
    onDone()
}, modifier = Modifier.fillMaxWidth()) { Text("Continue") }

    }
}
