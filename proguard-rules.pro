# Keep ZXing & CameraX essentials
-keep class com.google.zxing.** { *; }
-dontwarn com.google.zxing.**

-keep class androidx.camera.** { *; }
-dontwarn androidx.camera.**

# Keep Compose runtime generated classes
-keep class **$Composable
-keep class androidx.compose.** { *; }
-dontwarn androidx.compose.**

# Keep crypto providers
-keep class org.bouncycastle.** { *; }
-dontwarn org.bouncycastle.**
