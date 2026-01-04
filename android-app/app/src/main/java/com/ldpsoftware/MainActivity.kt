package com.ldpsoftware

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.ldpsoftware.ui.LoginScreen

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Start the LoginScreen activity
        val intent = Intent(this, LoginScreen::class.java)
        startActivity(intent)
        finish() // Close MainActivity after starting LoginScreen
    }
}