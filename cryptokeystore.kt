package com.example.chatbt.crypto

import android.os.Build
import java.security.*
import java.security.spec.ECGenParameterSpec
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties

object CryptoKeystore {
    private const val KS = "AndroidKeyStore"
    private const val ALIAS = "chatbt_ec_key"

    fun ensureKey(): KeyPair {
        val ks = KeyStore.getInstance(KS).apply { load(null) }
        if (ks.containsAlias(ALIAS)) {
            val priv = ks.getKey(ALIAS, null) as PrivateKey
            val pub = ks.getCertificate(ALIAS).publicKey
            return KeyPair(pub, priv)
        }
        val kpg = KeyPairGenerator.getInstance(
            KeyProperties.KEY_ALGORITHM_EC, KS
        )
        val spec = if (Build.VERSION.SDK_INT >= 23) {
            KeyGenParameterSpec.Builder(
                ALIAS, KeyProperties.PURPOSE_AGREE_KEY
            ).setDigests(KeyProperties.DIGEST_SHA256)
             .setAlgorithmParameterSpec(ECGenParameterSpec("secp256r1"))
             .build()
        } else {
            // Fallback (rare on targets <23): generate outside keystore
            null
        }
        if (spec != null) kpg.initialize(spec) else kpg.initialize(ECGenParameterSpec("secp256r1"))
        return kpg.generateKeyPair()
    }

    fun privateKey(): PrivateKey {
        val ks = KeyStore.getInstance(KS).apply { load(null) }
        return ks.getKey(ALIAS, null) as PrivateKey
    }

    fun publicKey(): PublicKey {
        val ks = KeyStore.getInstance(KS).apply { load(null) }
        return ks.getCertificate(ALIAS).publicKey
    }
}
