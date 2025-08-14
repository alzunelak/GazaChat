package com.example.chatbt.bt

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.content.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class BluetoothDiscovery(private val ctx: Context, private val adapter: BluetoothAdapter) {
    private val _devices = MutableStateFlow<List<BluetoothDevice>>(emptyList())
    val devices: StateFlow<List<BluetoothDevice>> = _devices

    private val found = mutableMapOf<String, BluetoothDevice>()

    private val receiver = object : BroadcastReceiver() {
        override fun onReceive(c: Context, i: Intent) {
            when(i.action) {
                BluetoothDevice.ACTION_FOUND -> {
                    val d: BluetoothDevice? = i.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
                    if (d != null && d.name != null) {
                        found[d.address] = d
                        _devices.value = found.values.toList()
                    }
                }
                BluetoothAdapter.ACTION_DISCOVERY_FINISHED -> { /* could restart */ }
            }
        }
    }

    fun start() {
        val f = IntentFilter().apply {
            addAction(BluetoothDevice.ACTION_FOUND)
            addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED)
        }
        ctx.registerReceiver(receiver, f)
        adapter.cancelDiscovery()
        adapter.startDiscovery()
    }

    fun stop() {
        try { ctx.unregisterReceiver(receiver) } catch (_:Throwable){}
        adapter.cancelDiscovery()
    }
}
