import OpenAI from "openai";
import { Promt } from "../model/promt.model.js";


const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,

  defaultHeaders: {
    "HTTP-Referer": "http://localhost:4001",
    "X-Title": "DeepSeek Clone Backend",
  },
});

export const sendPromt = async (req, res) => {
  const { content } = req.body
  const userId = req.userId;

  if (!content || content.trim() === "") {
    return res.status(400).json({ errors: "Prompt content is required" });
  }

  try {
    // 1. Save user prompt
    const userPrompt = await Promt.create({
      userId,
      role: "user",
      content,
    });

    // 2. Call OpenRouter (Gemma 4 31B free model)
    const completion = await openrouter.chat.completions.create({
      model: "google/gemma-4-31b-it:free",
      messages: [{ role: "user", content }],
      temperature: 0.7,
      max_tokens: 1000,
  
    });

    const aiContent = completion.choices[0].message.content;

    
    const assistantMessage = await Promt.create({
      userId,
      role: "assistant",
      content: aiContent,
    });

    return res.status(200).json({ reply: aiContent });
  } catch (error) {
    console.error("Error in sendPromt:", error);
    return res.status(500).json({ error: "Something went wrong with the AI response" });
  }
};