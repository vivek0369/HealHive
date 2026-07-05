import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

const systemPrompt = `You are the HealHive Symptom Triage Assistant. 
Your goal is to briefly analyze a user's reported symptoms and recommend the most appropriate medical specialty for them to consult (e.g., Cardiologist, Dermatologist, General Practitioner, Orthopedist).
Be empathetic, concise (max 2-3 sentences), and ALWAYS include this disclaimer at the end: "Disclaimer: I am an AI, not a doctor. This is for informational purposes only."`;

router.post("/triage", async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured in the server environment." });
    }

    // You can use gemini-1.5-flash or gemini-1.5-pro
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt 
    });
    
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("AI Triage Error:", error);
    res.status(500).json({ error: "Failed to generate AI response. Please try again later." });
  }
});

export default router;
