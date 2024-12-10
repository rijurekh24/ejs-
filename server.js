const express = require("express");
const path = require("path");
const axios = require("axios");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

function chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

app.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      "https://fc6c-14-142-19-238.ngrok-free.app/reports/pdf/?prn=PRN000001991436"
    );

    const patientData = response.data;
    const history = patientData.history; 

    const chunks = chunkArray(history, 4);

    res.render("index", {
      logoUrl: "/images/image.png",
      blackImageUrl: "/images/black.png",
      qrCodeUrl: "/images/qr.png",
      iconPolygonUrl: "/images/Polygon 3.svg",
      iconGlobeUrl: "/images/material-symbols_globe.svg",
      iconCallUrl: "/images/material-symbols_call.svg",
      introImageUrl: "/images/intro.png",
      greenLogoUrl: "/images/logo-green.png",
      rectangle22Url: "/images/Rectangle 22.png",
      bookingId: patientData.prn,
      patientName: patientData.patientDemographic.name,
      gender: patientData.patientDemographic.gender === "F" ? "Female" : "Male",
      age: patientData.patientDemographic.age,
      historyChunks: chunks, 
      history: history, 
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
