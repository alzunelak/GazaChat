package com.example.chatbt.ui.screens

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.example.chatbt.bt.BluetoothChatService
import com.example.chatbt.bt.BtMessageCodec
import com.example.chatbt.crypto.Crypto
import com.example.chatbt.data.Message
import com.example.chatbt.data.Store

@Composable
fun ChatScreen() {
    val ctx = LocalContext.current
    val profile = Store.loadProfile(ctx)
    val friend = Store.getLastFriend(ctx) ?: Store.listFriends(ctx).firstOrNull()
    var messages by remember { mutableStateOf(listOf<Message>()) }
    var input by remember { mutableStateOf("") }

    // Bluetooth + session key (demo key derivation: regenerate each session)
    val btAdapter = (ctx.getSystemService(android.content.Context.BLUETOOTH_SERVICE) as BluetoothManager).adapter
    var sessionKey by remember { mutableStateOf<ByteArray?>(null) }

    // For demo, start server; on the other phone, go to a picker and connect.
    var service: BluetoothChatService? by remember { mutableStateOf(null) }

    LaunchedEffect(Unit) {
        // Derive a session key (if both sides exchanged public keys, use them here)
        // For demo we just keep a static key (NOT SECURE). Replace with ECDH using Crypto.ecdhSecret(...)
        sessionKey = Crypto.deriveAesKey("demo-shared".toByteArray())
        service = BluetoothChatService(
            adapter = btAdapter,
            onConnected = { /* show toast */ },
            onMessage = { blob ->
                val key = sessionKey ?: return@BluetoothChatService
                val plain = try { Crypto.decryptAesGcm(key, blob) } catch (_:Throwable){ return@BluetoothChatService }
                messages = messages + Message(fromMe=false, text = plain.decodeToString())
            },
            onError = { /* show error */ }
        ).also { it.startServer() }
    }

    Column(Modifier.fillMaxSize()) {
        LazyColumn(Modifier.weight(1f).padding(12.dp)) {
            items(messages) { m ->
                if (m.fromMe) OutlinedCard(Modifier.fillMaxWidth().padding(4.dp), colors = CardDefaults.outlinedCardColors()) {
                    Text(m.text, Modifier.padding(8.dp))
                } else Card(Modifier.fillMaxWidth().padding(4.dp)) { Text(m.text, Modifier.padding(8.dp)) }
            }
        }
        Row(Modifier.padding(12.dp)) {
            OutlinedTextField(value = input, onValueChange = { input = it }, modifier = Modifier.weight(1f))
            Spacer(Modifier.width(8.dp))
            Button(onClick = {
                val text = input.trim()
                if (text.isEmpty()) return@Button
                val key = sessionKey ?: return@Button
                val enc = Crypto.encryptAesGcm(key, text.encodeToByteArray())
                val framed = BtMessageCodec.frame(enc)
                service?.send(framed)
                messages = messages + Message(fromMe=true, text=text)
                input = ""
            }) { Text("Send") }
        }
    }
}
