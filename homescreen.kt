package com.example.chatbt.ui.screens

import android.graphics.BitmapFactory
import android.util.Base64
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.example.chatbt.data.Store

@Composable
fun HomeScreen(onScan:()->Unit, onSearch:()->Unit, onMyQr:()->Unit, onChat:()->Unit) {
    val ctx = LocalContext.current
    val profile = remember { Store.loadProfile(ctx) }

    TopAppBar(
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(36.dp).clip(CircleShape)) {
                    if (profile?.photoBase64 != null) {
                        val bytes = Base64.decode(profile.photoBase64, Base64.NO_WRAP)
                        Image(BitmapFactory.decodeByteArray(bytes,0,bytes.size).asImageBitmap(), null, Modifier.fillMaxSize())
                    } else {
                        Text("👤")
                    }
                }
                Spacer(Modifier.width(8.dp))
                Text(profile?.username ?: "You", maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        },
        actions = {
            IconButton(onClick = onScan) { Text("📷") }
            IconButton(onClick = onSearch) { Text("🔍") }
        }
    )

    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("No messages yet. Add a friend to start chatting.", style = MaterialTheme.typography.bodyMedium)
        Spacer(Modifier.height(16.dp))
        ExtendedFloatingActionButton(text={ Text("Add Friend") }, icon={ Text("+") }, onClick = { /* show choices */ onScan() })
        Spacer(Modifier.height(24.dp))

        // Bottom menu simulation
        Spacer(Modifier.weight(1f))
       fun HomeScreen(
  onScan:()->Unit,
  onSearch:()->Unit,
  onMyQr:()->Unit,
  onChat:()->Unit,
  onGroups:()->Unit,
  onCalls:()->Unit
)

    }
}
