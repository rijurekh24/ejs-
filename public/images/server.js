const express = require("express");
const path = require("path");
const axios = require("axios"); // Import axios for API requests
const app = express();

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files (images, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Route to fetch data from API and render the report template
app.get("/", async (req, res) => {
  try {
    // Fetch data from the API (replace this with your actual API endpoint)
    const response = await axios.get(
      "https://fc6c-14-142-19-238.ngrok-free.app/reports/pdf/?prn=PRN000001991436"
    );
    const patientData = response.data; // Assume the response contains the patient data

    // Pass the API data to the EJS template
    res.render("index", {
      logoUrl: "/images/logo.png",
      blackImageUrl: "/images/black.png",
      qrCodeUrl: "/images/qr.png",
      iconPolygonUrl: "/images/Polygon3.svg",
      iconGlobeUrl: "/images/material-symbols_glbe.svg",
      iconCallUrl: "/images/material-symbols_call.svg",
      websiteUrl: "https://stylecheck.org",
      websiteName: "stylecheck.org",
      supportPhoneNumber: "0123456789",
      collegeName: "NY Patil Medical College",
      city: "Pune",
      state: "Maharashtra",
      bookingId: patientData.bookingId,
      patientName: patientData.name,
      gender: patientData.gender,
      age: patientData.age,
    });
  } catch (error) {
    console.error("Error fetching patient data:", error);
    res.status(500).send("Error fetching data");
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
