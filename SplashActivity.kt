import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import android.os.Handler
import android.os.Looper

class SplashActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        // Show splash for 2 seconds
        Handler(Looper.getMainLooper()).postDelayed({
            val intent = Intent(this, ProfileSetupActivity::class.java)
            startActivity(intent)
            finish()
        }, 2000)
    }
}
