import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {GoogleGenAI} from '@google/genai';


const app = express();
const PORT = 3000;

app.use(
    cors({
        origin: 'http://localhost:5174', // Replace
    })
);
app.use(express.json({ limit: "10kb"}));

const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey
  ? new GoogleGenAI({ apiKey })
  : null;



app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "AI Learning Chatbot backend is running!",
    aiConfigured: Boolean(ai),
  });
});

app.post("/api/chat", async (req, res) => {
    try {
        const { question } = req.body;

        if (typeof question !== "string" || !question.trim()) {
            return res.status(400).json({
                status: "error",
                message: "Please enter a question."
            });
        }

        if (question.length > 4000) {
            return res.status(400).json({
                error: "Your question must be 4000 characters or fewer."
            });
        }

        if (!ai) {
            return res.status(500).json({
                error: "The AI service is not configured on the server."
            });
        }

        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: question.trim(),
            config: {
                systemInstruction:
                    "You are a friendly programming tutor. Teach beginners step by step. Use simple language, explain technical terms, provide short code examples when useful, and encourage the learner to practice. If you are unsure of an answer, say so.",
            }
        });

        const answer = response.text;

        if (!answer){
            return res.status(502).json({
                error: "The AI did not return a text answer. Please try again."
            });
        }

        res.json({answer});

    } catch (error) {
        console.error("Error processing chat request:", error);
        res.status(500).json({
           error:
            "Sorry, the AI request failed. Check the server terminal and try again.",
        });
    }

});


app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  console.log(`Gemini configured: ${Boolean(ai)}`);
});