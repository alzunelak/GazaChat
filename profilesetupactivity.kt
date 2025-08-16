import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity
import kotlinx.coroutines.*

class profilesetupactivity : AppCompatActivity() {
    private lateinit var db: AppDatabase
    private lateinit var profileImage: ImageView
    private var imageUri: Uri? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile_setup)

        db = AppDatabase.getDatabase(this)
        profileImage = findViewById(R.id.profileImage)
        val nameInput = findViewById<EditText>(R.id.nameInput)
        val saveButton = findViewById<Button>(R.id.saveButton)

        profileImage.setOnClickListener {
            val intent = Intent(Intent.ACTION_PICK)
            intent.type = "image/*"
            startActivityForResult(intent, 100)
        }

        saveButton.setOnClickListener {
            val name = nameInput.text.toString()
            if (name.isNotEmpty()) {
                val user = User(
                    id = "user1",
                    name = name,
                    profileUrl = imageUri?.toString()
                )
                CoroutineScope(Dispatchers.IO).launch {
                    db.userDao().insertUser(user)
                    withContext(Dispatchers.Main) {
                        startActivity(Intent(this@ProfileSetupActivity, HomeActivity::class.java))
                        finish()
                    }
                }
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == 100 && resultCode == Activity.RESULT_OK) {
            imageUri = data?.data
            profileImage.setImageURI(imageUri)
        }
    }
}
