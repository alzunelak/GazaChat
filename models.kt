package com.example.chatbt.data

import java.util.UUID

data class UserProfile(
    val username: String,
    val publicKeyPem: String, // PEM-encoded EC public key (secp256r1)
    val photoBase64: String? = null
)

data class Friend(
    val id: String = UUID.randomUUID().toString(),
    val username: String,
    val publicKeyPem: String
)

data class Message(
    val id: String = UUID.randomUUID().toString(),
    val fromMe: Boolean,
    val text: String,
    val timestamp: Long = System.currentTimeMillis()
)
