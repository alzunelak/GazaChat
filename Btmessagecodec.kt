package com.example.chatbt.bt

import java.nio.ByteBuffer

object BtMessageCodec {
    // simple length-prefixed frame: [uint16 length][payload]
    fun frame(payload: ByteArray): ByteArray {
        require(payload.size <= 65535)
        val bb = ByteBuffer.allocate(2 + payload.size)
        bb.putShort(payload.size.toShort())
        bb.put(payload)
        return bb.array()
    }

    fun deframe(buffer: ByteArray): List<ByteArray> {
        val out = mutableListOf<ByteArray>()
        var i = 0
        while (i + 2 <= buffer.size) {
            val len = ((buffer[i].toInt() and 0xFF) shl 8) or (buffer[i+1].toInt() and 0xFF)
            if (i + 2 + len > buffer.size) break
            out += buffer.copyOfRange(i+2, i+2+len)
            i += 2 + len
        }
        return out
    }
}
