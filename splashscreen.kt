package com.example.chatbt.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp

@Composable
fun SplashScreen(onContinue: () -> Unit) {
    Column(Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
        // Replace with your mipmap logo if needed
        // or load from resources; for simplicity just a placeholder box:
        Spacer(Modifier.height(16.dp))
        Button(onClick = onContinue, modifier = Modifier.padding(top = 24.dp)) {
            Text("Continue")
        }
    }
}
