package com.example.chatbt.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.example.chatbt.data.Store

@Composable
fun GroupsScreen() {
    val ctx = LocalContext.current
    var groupName by remember { mutableStateOf("") }
    val friends = remember { Store.listFriends(ctx) }
    val selected = remember { mutableStateListOf<String>() }
    val groups = remember { mutableStateOf(Store.listGroups(ctx)) }

    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("Create Group")
        OutlinedTextField(value = groupName, onValueChange = { groupName = it }, label = { Text("Group name") })
        Spacer(Modifier.height(8.dp))
        Text("Members:")
        friends.forEach { f ->
            val checked = selected.contains(f.id)
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(f.username)
                Checkbox(checked = checked, onCheckedChange = {
                    if (it) selected.add(f.id) else selected.remove(f.id)
                })
            }
        }
        Button(onClick = {
            if (groupName.isNotBlank() && selected.isNotEmpty()) {
                Store.saveGroup(ctx, com.example.chatbt.data.Group(name=groupName, memberIds=selected.toList()))
                groups.value = Store.listGroups(ctx)
                groupName = ""; selected.clear()
            }
        }, modifier = Modifier.fillMaxWidth()) { Text("Create") }

        Spacer(Modifier.height(16.dp))
        Divider()
        Text("Your Groups", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(top=8.dp))
        groups.value.forEach { g ->
            ListItem(headlineText = { Text(g.name) }, supportingText = { Text("${g.memberIds.size} members") })
            Divider()
        }
    }
}
