package com.example.chatbt.ui.screens

import android.bluetooth.BluetoothDevice
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.example.chatbt.bt.BluetoothDiscovery
import com.example.chatbt.bt.BtHub
import kotlinx.coroutines.launch

@Composable
fun DevicePickerScreen(onConnected:()->Unit) {
    val ctx = LocalContext.current
    val adapter = (ctx.getSystemService(android.content.Context.BLUETOOTH_SERVICE)
            as android.bluetooth.BluetoothManager).adapter

    val discovery = remember { BluetoothDiscovery(ctx, adapter) }
    val scope = rememberCoroutineScope()
    val devices by discovery.devices.collectAsState()

    LaunchedEffect(Unit) { discovery.start() }
    DisposableEffect(Unit) { onDispose { discovery.stop() } }

    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("Select a device to connect")
        Spacer(Modifier.height(12.dp))
        devices.forEach { d: BluetoothDevice ->
            Card(Modifier.fillMaxWidth().padding(vertical = 6.dp).clickable {
                val svc = BtHub.ensureService(ctx, onConnected = { onConnected() },
                    onMessage = {}, onError = { })
                svc.connectTo(d)
            }) {
                Column(Modifier.padding(12.dp)) {
                    Text(d.name ?: "Unknown")
                    Text(d.address, style = MaterialTheme.typography.bodySmall)
                }
            }
        }
        Spacer(Modifier.weight(1f))
        Text("Tip: one phone stays on Chat screen (server), the other uses this picker (client).")
    }
}
