// api/chat.js
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { message, history } = req.body; // Front-end se 'history' bhi aa raha hai

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const chatMessages = [
      { role: "system", content: `You are Agni AI — a warm, smart, and natural conversational assistant. You feel like a brilliant friend, not a robot. Always match the user's language and energy (Hindi, English, or Hinglish). Keep replies naturally sized — short when the question is simple, detailed when needed. Be thoughtful, occasionally witty. No robotic formatting unless truly helpful. Never mention you are Claude or made by Anthropic.` },
      ...(history || []), // Add previous messages if available
      { role: "user", content: message },
    ];

    const completion = await groq.chat.completions.create({
      messages: chatMessages,
      model: "llama3-8b-8192", // You can change this to "llama3-70b-8192" for better performance but higher latency
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stop: null,
      stream: false, // Streaming will be handled by frontend for better control
    });

    res.status(200).json(completion);
  } catch (error) {
    console.error("Groq API Error:", error);
    res.status(500).json({ error: error.message || "Failed to get response from Agni AI." });
  }
}
