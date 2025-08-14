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

   // inside LaunchedEffect(Unit)
LaunchedEffect(Unit) {
    val friendPubPem = friend?.publicKeyPem ?: ""
    if (friendPubPem.isBlank()) {
        // You added friend by username only — ask to scan QR to get their key
        messages = messages + Message(fromMe=false, text="(Scan your friend’s QR to enable encrypted chat)")
    } else {
        val myPriv = com.example.chatbt.crypto.CryptoKeystore.privateKey()
        val peerPub = com.example.chatbt.crypto.Crypto.pemToPublicKey(friendPubPem)
        val secret = com.example.chatbt.crypto.Crypto.ecdhSecret(myPriv, peerPub)
        sessionKey = com.example.chatbt.crypto.Crypto.deriveAesKey(secret)
    }

    val svc = com.example.chatbt.bt.BtHub.ensureService(
        ctx,
        onConnected = { /* show something*/ },
        onMessage = { framed ->
            val key = sessionKey ?: return@ensureService
            // framed already includes IV (encryptAesGcm output)
            val plain = try { com.example.chatbt.crypto.Crypto.decryptAesGcm(key, framed) } catch (_:Throwable){ return@ensureService }
            messages = messages + Message(fromMe=false, text = plain.decodeToString())
        },
        onError = { /* error */ }
    )
    service = svc

    // One device should call startServer(); the other uses DevicePicker to connect.
    svc.startServer()
}

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
    val key = sessionKey
    if (key == null) {
        messages = messages + Message(fromMe=false, text="(No shared key. Scan QR to exchange keys.)")
        return@Button
    }
    val enc = com.example.chatbt.crypto.Crypto.encryptAesGcm(key, text.encodeToByteArray())
    service?.send(enc)
    messages = messages + Message(fromMe=true, text=text)
    input = ""
}) { Text("Send") }

        }
    }
}
