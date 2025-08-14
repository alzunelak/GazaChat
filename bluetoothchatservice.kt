package com.example.chatbt.bt

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothServerSocket
import android.bluetooth.BluetoothSocket
import kotlinx.coroutines.*
import java.io.InputStream
import java.io.OutputStream
import java.util.UUID

class BluetoothChatService(
    private val adapter: BluetoothAdapter,
    private val onConnected: (BluetoothDevice) -> Unit,
    private val onMessage: (ByteArray) -> Unit,
    private val onError: (Throwable) -> Unit
) {
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    // Random but fixed UUID for our app’s SPP service
    private val APP_UUID: UUID = UUID.fromString("9b1deb4d-5b14-4b2b-9e0a-89e0f0f0a999")

    private var serverJob: Job? = null
    private var clientJob: Job? = null
    private var conn: Connection? = null

    data class Connection(
        val socket: BluetoothSocket,
        val input: InputStream,
        val output: OutputStream
    )

    fun startServer(appName: String = "ChatBT") {
        stop()
        serverJob = scope.launch {
            try {
                val serverSocket: BluetoothServerSocket =
                    adapter.listenUsingRfcommWithServiceRecord(appName, APP_UUID)
                val socket = serverSocket.accept() // blocking until a client connects
                serverSocket.close()
                connected(socket)
            } catch (t: Throwable) { onError(t) }
        }
    }

    fun connectTo(device: BluetoothDevice) {
        stop()
        clientJob = scope.launch {
            try {
                val socket = device.createRfcommSocketToServiceRecord(APP_UUID)
                adapter.cancelDiscovery()
                socket.connect()
                connected(socket)
            } catch (t: Throwable) { onError(t) }
        }
    }

    private fun connected(socket: BluetoothSocket) {
        conn = Connection(socket, socket.inputStream, socket.outputStream)
        onConnected(socket.remoteDevice)
        // start reading
        scope.launch {
            val buf = ByteArray(4096)
            while (true) {
                val n = conn!!.input.read(buf)
                if (n <= 0) break
                onMessage(buf.copyOfRange(0, n))
            }
        }
    }

    fun send(bytes: ByteArray) {
        scope.launch {
            try { conn?.output?.write(bytes) } catch (t: Throwable) { onError(t) }
        }
    }

    fun stop() {
        serverJob?.cancel(); clientJob?.cancel()
        try { conn?.socket?.close() } catch (_:Throwable) {}
        conn = null
    }
}
