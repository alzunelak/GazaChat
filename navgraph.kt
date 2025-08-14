package com.example.chatbt.nav

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.chatbt.ui.screens.*

composable("home")   { HomeScreen(
    onScan = { nav.navigate("scan") },
    onSearch = { nav.navigate("search") },
    onMyQr = { nav.navigate("myqr") },
    onChat = { nav.navigate("devicepicker") }, // client picks device then goes to chat
    onGroups = { nav.navigate("groups") },
    onCalls = { nav.navigate("calls") }
) }
composable("devicepicker") { DevicePickerScreen(onConnected = { nav.navigate("chat") }) }
composable("groups") { GroupsScreen() }
composable("calls") { CallsScreen() }


@Composable
fun NavGraph() {
    val nav: NavHostController = rememberNavController()
    NavHost(navController = nav, startDestination = "splash") {
        composable("splash") { SplashScreen { nav.navigate("name") { popUpTo("splash"){inclusive=true} } } }
        composable("name")   { NameScreen(onDone = { nav.navigate("home"){ popUpTo("name"){inclusive=true} } }) }
        composable("home")   { HomeScreen(
            onScan = { nav.navigate("scan") },
            onSearch = { nav.navigate("search") },
            onMyQr = { nav.navigate("myqr") },
            onChat = { nav.navigate("chat") }
        ) }
        composable("scan")   { ScanScreen(onFriendReady = { nav.navigate("home") }) }
        composable("search") { SearchScreen(onFriendReady = { nav.navigate("home") }) }
        composable("chat")   { ChatScreen() }
        composable("myqr")   { MyQrScreen() }
    }
}
