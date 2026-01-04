package com.ldpsoftware.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.ldpsoftware.R

class LabReportScreen : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var labReportAdapter: LabReportAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.screen_lab_report)

        recyclerView = findViewById(R.id.recycler_view_lab_reports)
        recyclerView.layoutManager = LinearLayoutManager(this)

        // Sample data for lab reports
        val labReports = listOf(
            LabReport("Vendor A", "Milk Type A", "Vehicle A", "Report 1"),
            LabReport("Vendor B", "Milk Type B", "Vehicle B", "Report 2")
        )

        labReportAdapter = LabReportAdapter(labReports)
        recyclerView.adapter = labReportAdapter
    }
}

data class LabReport(
    val vendorName: String,
    val milkType: String,
    val vehicleInfo: String,
    val reportDetails: String
)

class LabReportAdapter(private val labReports: List<LabReport>) : RecyclerView.Adapter<LabReportAdapter.LabReportViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): LabReportViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_lab_report, parent, false)
        return LabReportViewHolder(view)
    }

    override fun onBindViewHolder(holder: LabReportViewHolder, position: Int) {
        val labReport = labReports[position]
        holder.bind(labReport)
    }

    override fun getItemCount(): Int = labReports.size

    class LabReportViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val vendorNameTextView: TextView = itemView.findViewById(R.id.text_view_vendor_name)
        private val milkTypeTextView: TextView = itemView.findViewById(R.id.text_view_milk_type)
        private val vehicleInfoTextView: TextView = itemView.findViewById(R.id.text_view_vehicle_info)
        private val reportDetailsTextView: TextView = itemView.findViewById(R.id.text_view_report_details)

        fun bind(labReport: LabReport) {
            vendorNameTextView.text = labReport.vendorName
            milkTypeTextView.text = labReport.milkType
            vehicleInfoTextView.text = labReport.vehicleInfo
            reportDetailsTextView.text = labReport.reportDetails
        }
    }
}