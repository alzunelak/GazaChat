package com.example.chatbt.crypto

import android.util.Base64
import java.security.*
import java.security.spec.ECGenParameterSpec
import javax.crypto.Cipher
import javax.crypto.KeyAgreement
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

object Crypto {
    // Generate EC P-256 keypair (secp256r1)
    fun generateKeyPair(): KeyPair {
        val kpg = KeyPairGenerator.getInstance("EC")
        kpg.initialize(ECGenParameterSpec("secp256r1"), SecureRandom())
        return kpg.generateKeyPair()
    }

    fun publicKeyToPem(pub: PublicKey): String {
        val b64 = Base64.encodeToString(pub.encoded, Base64.NO_WRAP)
        return "-----BEGIN PUBLIC KEY-----\n$b64\n-----END PUBLIC KEY-----"
    }

    fun pemToPublicKey(pem: String): PublicKey {
        val clean = pem.replace("-----BEGIN PUBLIC KEY-----","")
            .replace("-----END PUBLIC KEY-----","")
            .replace("\\s".toRegex(),"")
        val bytes = Base64.decode(clean, Base64.DEFAULT)
        val kf = KeyFactory.getInstance("EC")
        return kf.generatePublic(java.security.spec.X509EncodedKeySpec(bytes))
    }

    fun ecdhSecret(priv: PrivateKey, peerPub: PublicKey): ByteArray {
        val ka = KeyAgreement.getInstance("ECDH")
        ka.init(priv)
        ka.doPhase(peerPub, true)
        return ka.generateSecret() // raw 32 bytes
    }

    // Derive 256-bit AES key from ECDH via SHA-256
    fun deriveAesKey(secret: ByteArray): ByteArray {
        val md = MessageDigest.getInstance("SHA-256")
        return md.digest(secret)
    }

    fun encryptAesGcm(aesKey: ByteArray, plaintext: ByteArray): ByteArray {
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        val iv = SecureRandom().generateSeed(12)
        cipher.init(Cipher.ENCRYPT_MODE, SecretKeySpec(aesKey, "AES"), GCMParameterSpec(128, iv))
        val ct = cipher.doFinal(plaintext)
        return iv + ct // prepend IV
    }

    fun decryptAesGcm(aesKey: ByteArray, blob: ByteArray): ByteArray {
        val iv = blob.copyOfRange(0, 12)
        val ct = blob.copyOfRange(12, blob.size)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, SecretKeySpec(aesKey,"AES"), GCMParameterSpec(128, iv))
        return cipher.doFinal(ct)
    }
}
