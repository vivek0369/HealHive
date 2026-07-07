import express from "express";
import PDFDocument from "pdfkit";

const router = express.Router();

router.post("/generate", async (req, res, next) => {
  try {
    const { patientName, doctorName, specialty, date, medications, notes, consultationId } = req.body;

    // Create a new PDFDocument
    const doc = new PDFDocument({ margin: 50 });

    // Stream the PDF to the response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="prescription_${patientName?.replace(/\s+/g, '_') || 'patient'}.pdf"`
    );
    
    doc.pipe(res);

    // --- PDF Formatting ---

    // Header
    doc
      .fillColor("#059669") // Emerald 600
      .fontSize(28)
      .text("HealHive", { align: "center", font: "Helvetica-Bold" })
      .fillColor("#64748b") // Slate 500
      .fontSize(12)
      .text("Digital Telehealth Prescription", { align: "center" })
      .moveDown(2);

    // Divider
    doc
      .moveTo(50, 120)
      .lineTo(550, 120)
      .strokeColor("#e2e8f0") // Slate 200
      .stroke()
      .moveDown(2);

    // Doctor & Patient Info
    doc.fillColor("#0f172a").fontSize(14).text(`Doctor: Dr. ${doctorName || "Unknown"}`, { font: "Helvetica-Bold" });
    if (specialty) {
      doc.fillColor("#64748b").fontSize(12).text(`Specialty: ${specialty}`, { font: "Helvetica" });
    }
    
    doc.moveDown(1);
    
    doc.fillColor("#0f172a").fontSize(14).text(`Patient: ${patientName || "Unknown"}`, { font: "Helvetica-Bold" });
    doc.fillColor("#64748b").fontSize(12).text(`Date: ${date || new Date().toLocaleDateString()}`);
    if (consultationId) {
      doc.text(`Consultation Ref: ${consultationId.slice(0, 8).toUpperCase()}`);
    }

    doc.moveDown(2);

    // Medications Section
    doc
      .fillColor("#059669")
      .fontSize(16)
      .text("Rx Medications", { font: "Helvetica-Bold", underline: true })
      .moveDown(0.5);

    doc
      .fillColor("#334155") // Slate 700
      .fontSize(12)
      .text(medications || "No medications prescribed.", {
        font: "Helvetica",
        lineGap: 4,
      })
      .moveDown(2);

    // Notes Section
    doc
      .fillColor("#059669")
      .fontSize(16)
      .text("Clinical Notes / Advice", { font: "Helvetica-Bold", underline: true })
      .moveDown(0.5);

    doc
      .fillColor("#334155")
      .fontSize(12)
      .text(notes || "No additional notes.", {
        font: "Helvetica",
        lineGap: 4,
      })
      .moveDown(3);

    // Footer
    // Divider
    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .strokeColor("#e2e8f0")
      .stroke()
      .moveDown(1);

    doc
      .fillColor("#94a3b8") // Slate 400
      .fontSize(10)
      .text("This is an automatically generated, digitally signed document by HealHive.", {
        align: "center",
        font: "Helvetica-Oblique",
      });

    // Finalize the PDF
    doc.end();
  } catch (err) {
    console.error("PDF Generation Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  }
});

export default router;
