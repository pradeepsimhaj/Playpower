// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const pdfParse = require("pdf-parse");
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// require("dotenv").config();

// const app = express();
// const port = process.env.PORT || 5000;

// // --- MIDDLEWARE SETUP ---
// app.use(cors());
// app.use(express.json());

// // --- FILE UPLOAD SETUP ---
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 30 * 1024 * 1024 }, // Limit to 10MB
// });

// // --- GOOGLE GEMINI AI SETUP ---
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// // --- UTILITY FUNCTIONS ---

// // Extracts text from PDF buffer
// const pdfToText = async (buffer) => {
//   const data = await pdfParse(buffer);
//   return data?.text;
// };

// // Splits large text into manageable chunks
// const textChunking = (text, maxLength = 1000) => {
//   const chunks = [];
//   let start = 0;
//   while (start < text.length) {
//     chunks.push(text.slice(start, start + maxLength));
//     start += maxLength;
//   }
//   return chunks;
// };

// // Get text embedding using Gemini
// const getEmbeddingFromText = async (text) => {
//   const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
//   const result = await embeddingModel.embedContent(text);
//   return result.embedding.values;
// };

// // Compare two embedding vectors using cosine similarity
// const cosineSimilarity = (vecA, vecB) => {
//   const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
//   const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
//   const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
//   return dot / (magA * magB);
// };

// // In-memory store for PDF content chunks and their embeddings
// const vectorStore = [];

// // --- SSE SETUP ---
// const clients = new Map(); // Store client responses for SSE

// // Middleware to track upload progress
// const trackUploadProgress = (req, res, next) => {
//   let received = 0;
//   const contentLength = parseInt(req.headers["content-length"] || "0");

//   req.on("data", (chunk) => {
//     received += chunk.length;
//     const progress = contentLength ? Math.round((received / contentLength) * 100) : 0;

//     // Send progress to all connected SSE clients
//     clients.forEach((clientRes, clientId) => {
//       clientRes.write(`data: ${JSON.stringify({ progress })}\n\n`);
//     });
//   });

//   next();
// };

// // SSE endpoint for progress updates
// app.get("/progress", (req, res) => {
//   const clientId = Date.now().toString();

//   res.writeHead(200, {
//     "Content-Type": "text/event-stream",
//     "Cache-Control": "no-cache",
//     Connection: "keep-alive",
//   });

//   clients.set(clientId, res);

//   // Clean up when client disconnects
//   req.on("close", () => {
//     clients.delete(clientId);
//     res.end();
//   });
// });

// // --- ROUTES ---

// // Upload and process PDF
// app.post("/upload", trackUploadProgress, upload.single("pdf"), async (req, res) => {
//   try {
//     const fileBuffer = req.file.buffer;
//     const text = await pdfToText(fileBuffer);
//     const chunks = textChunking(text);

//     // Clear old data
//     vectorStore.length = 0;

//     // Create and store embeddings for each chunk
//     for (let i = 0; i < chunks.length; i++) {
//       const embedding = await getEmbeddingFromText(chunks[i]);
//       vectorStore.push({ id: i, text: chunks[i], embedding });
//     }

//     // Notify clients of completion
//     clients.forEach((clientRes) => {
//       clientRes.write(`data: ${JSON.stringify({ progress: 100, complete: true })}\n\n`);
//     });

//     res.send({
//       message: "PDF processed. You can now ask questions.",
//       chunksCount: chunks.length,
//       success: true,
//     });
//   } catch (err) {
//     console.error("Upload Error:", err);
//     res.status(500).json({ error: "❌ Failed to process PDF" });
//   }
// });

// // Ask a question based on uploaded PDF
// app.post("/ask", async (req, res) => {
//   try {
//     const { question } = req.body;
//     const embeddedQuestion = await getEmbeddingFromText(question);

//     // Get top 3 matching chunks
//     const rankedChunks = vectorStore
//       .map((item) => ({
//         ...item,
//         similarity: cosineSimilarity(embeddedQuestion, item.embedding),
//       }))
//       .sort((a, b) => b.similarity - a.similarity)
//       .slice(0, 3);

//     const context = rankedChunks.map((c) => c.text).join("\n\n");

//     const prompt = `You are an AI assistant. Answer using this PDF context when relevant.\n\nContext:\n${context}\n\nQuestion:\n${question}`;

//     const response = await model.generateContent(prompt);

//     res.send({
//       ans: response?.response.text(),
//       citations: rankedChunks.map((c) => c.id),
//     });
//   } catch (err) {
//     console.error("Ask Error:", err);
//     res.status(500).json({ error: "❌ Failed to answer question" });
//   }
// });

// // Root check
// app.get("/", (req, res) => {
//   res.send("✅ PDF QA API is live!");
// });

// // Start server
// app.listen(port, () => {
//   console.log(`🚀 Server is running on http://localhost:${port}`);
// });


















const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000; // Use Vercel's dynamic port

// --- MIDDLEWARE SETUP ---
app.use(cors());
app.use(express.json());

// --- FILE UPLOAD SETUP ---
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB limit
});

// --- GOOGLE GEMINI AI SETUP ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- UTILITY FUNCTIONS ---

// Extracts text from PDF buffer
const pdfToText = async (buffer) => {
  const data = await pdfParse(buffer);
  return data?.text;
};

// Splits large text into manageable chunks
const textChunking = (text, maxLength = 1000) => {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + maxLength));
    start += maxLength;
  }
  return chunks;
};

// Get text embedding using Gemini
const getEmbeddingFromText = async (text) => {
  const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
};

// Compare two embedding vectors using cosine similarity
const cosineSimilarity = (vecA, vecB) => {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
};

// In-memory store for PDF content chunks and their embeddings
const vectorStore = [];

// --- SSE SETUP ---
const clients = new Map(); // Store client responses for SSE

// Middleware to track upload progress
const trackUploadProgress = (req, res, next) => {
  let received = 0;
  const contentLength = parseInt(req.headers["content-length"] || "0");

  req.on("data", (chunk) => {
    received += chunk.length;
    const progress = contentLength ? Math.round((received / contentLength) * 100) : 0;

    // Send progress to all connected SSE clients
    clients.forEach((clientRes, clientId) => {
      clientRes.write(`data: ${JSON.stringify({ progress })}\n\n`);
    });
  });

  next();
};

// SSE endpoint for progress updates
app.get("/progress", (req, res) => {
  const clientId = Date.now().toString();

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  clients.set(clientId, res);

  // Clean up when client disconnects
  req.on("close", () => {
    clients.delete(clientId);
    res.end();
  });
});

// --- ROUTES ---

// Upload and process PDF
app.post("/upload", trackUploadProgress, upload.single("pdf"), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const text = await pdfToText(fileBuffer);
    const chunks = textChunking(text);

    // Clear old data
    vectorStore.length = 0;

    // Create and store embeddings for each chunk
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await getEmbeddingFromText(chunks[i]);
      vectorStore.push({ id: i, text: chunks[i], embedding });
    }

    // Notify clients of completion
    clients.forEach((clientRes) => {
      clientRes.write(`data: ${JSON.stringify({ progress: 100, complete: true })}\n\n`);
    });

    res.send({
      message: "PDF processed. You can now ask questions.",
      chunksCount: chunks.length,
      success: true,
    });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "❌ Failed to process PDF" });
  }
});

// Ask a question based on uploaded PDF
app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;
    const embeddedQuestion = await getEmbeddingFromText(question);

    // Get top 3 matching chunks
    const rankedChunks = vectorStore
      .map((item) => ({
        ...item,
        similarity: cosineSimilarity(embeddedQuestion, item.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    const context = rankedChunks.map((c) => c.text).join("\n\n");

    const prompt = `You are an AI assistant. Answer using this PDF context when relevant.\n\nContext:\n${context}\n\nQuestion:\n${question}`;

    const response = await model.generateContent(prompt);

    res.send({
      ans: response?.response.text(),
      citations: rankedChunks.map((c) => c.id),
    });
  } catch (err) {
    console.error("Ask Error:", err);
    res.status(500).json({ error: "❌ Failed to answer question" });
  }
});

// Root check
app.get("/", (req, res) => {
  res.send("✅ PDF QA API is live!");
});

// Export the app for Vercel
module.exports = app;