package com.example.chatbt.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.chatbt.data.Friend
import com.example.chatbt.data.Store

@Composable
fun SearchScreen(onFriendReady:()->Unit) {
    val ctx = LocalContext.current
    var username by remember { mutableStateOf("") }
    Column(Modifier.fillMaxSize().padding(16.dp)) {
        OutlinedTextField(value = username, onValueChange = { username = it }, label = { Text("Friend username") })
        Spacer(Modifier.height(12.dp))
        Button(onClick = {
            if (username.isNotBlank()) {
                Store.saveFriend(ctx, Friend(username = username.trim(), publicKeyPem = ""))
                onFriendReady()
            }
        }, modifier = Modifier.fillMaxWidth()) { Text("Start Chat") }
    }
}
