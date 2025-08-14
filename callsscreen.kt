package com.example.chatbt.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier

@Composable
fun CallsScreen() {
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("Calls are coming soon.\nThis tab will let you place audio calls over Bluetooth.", textAlign = androidx.compose.ui.text.style.TextAlign.Center)
    }
}
