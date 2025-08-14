package com.example.chatbt.bt

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.content.Context

object BtHub {
    @Volatile var service: BluetoothChatService? = null

    fun ensureService(ctx: Context, onConnected: (android.bluetooth.BluetoothDevice)->Unit,
                      onMessage: (ByteArray)->Unit, onError:(Throwable)->Unit): BluetoothChatService {
        val adapter = (ctx.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager).adapter
        val cur = service
        if (cur != null) return cur
        val s = BluetoothChatService(adapter, onConnected, onMessage, onError)
        service = s
        return s
    }
}
