
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Ollama runs locally on your computer.
const OLLAMA_URL =
  process.env.OLLAMA_URL || 'http://localhost:11434';

const MODEL =
  process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b';

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

app.use(express.json({ limit: '10kb' }));

// Check backend configuration.
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'AI Learning Chatbot backend is running!',
    aiConfigured: true,
    provider: 'Ollama',
    model: MODEL,
  });
});

// Send a question to Ollama.
app.post('/api/chat', async (req, res) => {
  try {
    const { question, history } = req.body;

    if (typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Please enter a question.',
      });
    }

    if (question.length > 4000) {
      return res.status(400).json({
        error: 'Your question must be 4000 characters or fewer.',
      });
    }

    // Keep only valid user and assistant messages.
    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (message) =>
              message &&
              (message.role === 'user' ||
                message.role === 'assistant') &&
              typeof message.text === 'string' &&
              message.text.trim()
          )
          .slice(-12)
          .map((message) => ({
            role: message.role,
            content: message.text.trim().slice(0, 4000),
          }))
      : [];

    // Ollama uses "content" instead of Gemini's "parts".
    const ollamaResponse = await fetch(
      `${OLLAMA_URL}/api/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          stream: false,
          messages: [
            {
              role: 'system',
              content:
                'You are a friendly programming tutor. Teach beginners step by step. Use simple language, explain technical terms, provide short code examples when useful, and encourage the learner to practice. If you are unsure of an answer, say so.',
            },
            ...safeHistory,
            {
              role: 'user',
              content: question.trim(),
            },
          ],
        }),
      }
    );

    if (!ollamaResponse.ok) {
      const errorDetails = await ollamaResponse.text();

      console.error('Ollama request failed:', errorDetails);

      return res.status(502).json({
        error:
          'The local AI request failed. Check that Ollama is running and the model is installed.',
      });
    }

    const data = await ollamaResponse.json();
    const answer = data.message?.content;

    if (typeof answer !== 'string' || !answer.trim()) {
      return res.status(502).json({
        error:
          'The AI did not return a text answer. Please try again.',
      });
    }

    return res.json({ answer });
  } catch (error) {
    console.error('Error processing chat request:', error);

    return res.status(500).json({
      error:
        'Sorry, the local AI request failed. Check that Ollama is running and try again.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  console.log(`AI provider: Ollama`);
  console.log(`Model: ${MODEL}`);
  console.log(`Ollama URL: ${OLLAMA_URL}`);
});
