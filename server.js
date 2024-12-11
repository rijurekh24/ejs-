const express = require("express");
const path = require("path");
const axios = require("axios");
const puppeteer = require("puppeteer");
const fs = require("fs");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use('/patient-reports', express.static(path.join(__dirname, 'patient-reports')));

function chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

app.get("/", async (req, res) => {
  const prn = req.query.prn;

  if (!prn) {
    return res
      .status(400)
      .send("PRN number is required in the query parameter");
  }

  try {
    const response = await axios.get(
      `https://fc6c-14-142-19-238.ngrok-free.app/reports/pdf/?prn=${prn}`
    );

    const patientData = response.data;
    const history = patientData.history;

    const plotableTests = history.filter((test) => test.isGraphPlotable);
    const chunks = chunkArray(plotableTests, 4);

    const pdfDir = path.join(__dirname, "patient-reports");
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir);
    }

    const htmlContent = await new Promise((resolve, reject) => {
      res.render("index", {
        logoUrl: "http://localhost:3000/images/logo.png", 
        grayUrl: "http://localhost:3000/images/logo.png",
        blackImageUrl: "http://localhost:3000/images/black.png",
        qrCodeUrl: "http://localhost:3000/images/QR.png",
        iconPolygonUrl: "http://localhost:3000/images/Polygon 3.svg",
        iconGlobeUrl: "http://localhost:3000/images/material-symbols_globe.svg",
        iconCallUrl: "http://localhost:3000/images/material-symbols_call.svg",
        introImageUrl: "http://localhost:3000/images/intro.png",
        greenLogoUrl: "http://localhost:3000/images/logo-green.png",
        rectangle22Url: "http://localhost:3000/images/Rectangle 22.png",
        thyroid: "http://localhost:3000/images/healthicons_thyroid.svg",
        bookingId: patientData.prn,
        patientName: patientData.patientDemographic.name,
        gender: patientData.patientDemographic.gender === "F" ? "Female" : "Male",
        age: patientData.patientDemographic.age,
        historyChunks: chunks,
        history: history,
      }, (err, html) => {
        if (err) {
          reject(err);
        } else {
          resolve(html);
        }
      });
    });

    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 
      headless: true,  
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();

    await page.setContent(htmlContent);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true, 
    });

    await browser.close();

    const pdfPath = path.join(pdfDir, `${prn}-report.pdf`);

    fs.writeFile(pdfPath, pdfBuffer, (err) => {
      if (err) {
        console.error("Error saving PDF:", err);
        return res.status(500).send("Error saving PDF");
      }

      res.send(`
        <html>
          <head>
            <title>Report Generated</title>
            <style>
              body { font-family:sans-serif; text-align: center; padding: 20px; }
              button { font-size: 16px; padding: 10px 20px; cursor: pointer; }
            </style>
          </head>
          <body>
            <h2>Report for PRN: ${prn} is ready!</h2>
            <p>Your report is ready to be downloaded. Please click the button below to open it in a new tab.</p>
            <button onclick="window.open('/patient-reports/${prn}-report.pdf', '_blank')">Open Report in New Tab</button>
          </body>
        </html>
      `);
    });

  } catch (error) {
    console.error("Error fetching patient data:", error);
    res.status(500).send("Error fetching data");
  }
});


app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
