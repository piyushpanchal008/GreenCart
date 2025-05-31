// copilotRoute.js
import express from "express";
import { getAIResponse } from "../utils/openaiClient.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const userMessages = req.body.messages;
    if (!userMessages || !Array.isArray(userMessages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }
    const aiMessage = await getAIResponse(userMessages);
    res.json({ reply: aiMessage });
  } catch (error) {
    console.error("OpenAI API error:", error);
    if (error.code === "insufficient_quota") {
    return res.status(429).json({ error: "API quota exceeded, please try later." });
  }
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

export default router;
