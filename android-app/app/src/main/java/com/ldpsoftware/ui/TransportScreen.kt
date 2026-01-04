package com.ldpsoftware.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import android.widget.EditText
import android.widget.Button
import android.widget.Toast

class TransportScreen : AppCompatActivity() {

    private lateinit var vehicleNumberEditText: EditText
    private lateinit var driverNameEditText: EditText
    private lateinit var submitButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.screen_transport)

        vehicleNumberEditText = findViewById(R.id.vehicleNumberEditText)
        driverNameEditText = findViewById(R.id.driverNameEditText)
        submitButton = findViewById(R.id.submitButton)

        submitButton.setOnClickListener {
            handleTransportSubmission()
        }
    }

    private fun handleTransportSubmission() {
        val vehicleNumber = vehicleNumberEditText.text.toString()
        val driverName = driverNameEditText.text.toString()

        if (vehicleNumber.isEmpty() || driverName.isEmpty()) {
            Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show()
        } else {
            // Handle the transport data submission logic here
            Toast.makeText(this, "Transport data submitted", Toast.LENGTH_SHORT).show()
        }
    }
}