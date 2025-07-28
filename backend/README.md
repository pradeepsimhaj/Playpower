Playpower Backend
This is the backend for the Playpower application, a Node.js and Express-based API that allows users to upload PDF files (up to 30MB), process them, and ask questions based on their content using Google’s Gemini AI. The backend uses Server-Sent Events (SSE) to provide real-time upload progress updates to the frontend.
Features

PDF Upload: Accepts PDF files up to 30MB and extracts text using pdf-parse.
Text Processing: Splits extracted text into chunks and generates embeddings using Gemini AI.
Question Answering: Answers questions based on the uploaded PDF’s content using vector similarity search.
Real-Time Progress: Uses SSE to stream upload progress to the frontend.
Serverless Deployment: Configured for deployment on Vercel.

Folder Structure
playpower/backend/
├── node_modules/          # Node.js dependencies
├── server.js             # Main Express server file
├── vercel.json           # Vercel configuration for serverless deployment
├── .env                  # Environment variables (not tracked in Git)
├── .gitignore            # Git ignore file
├── package.json          # Project metadata and dependencies
├── package-lock.json     # Dependency lock file

Prerequisites

Node.js: Version 14.x or higher
npm: Version 6.x or higher
Vercel CLI: For deployment (optional for local development)
Google Gemini API Key: Required for text embedding and question answering

Installation

Clone the Repository:
[git clone https://github.com/your-username/playpower.git](combined repo for frontend and backend)
cd playpower-backend


Install Dependencies:
npm install


Set Up Environment Variables:Create a .env file in the backend folder with the following:
GEMINI_API_KEY=your-google-gemini-api-key
PORT=5000

Replace your-google-gemini-api-key with your actual Gemini API key.


Running Locally

Start the server:
npm start

The server will run on http://localhost:5000 (or the port specified in .env).

Test the API:

Root Endpoint: GET http://localhost:5000/ (Returns "✅ PDF QA API is live!")
Upload PDF: POST http://localhost:5000/upload (multipart/form-data with a pdf field)
Ask Question: POST http://localhost:5000/ask (JSON body with question field)
Progress Updates: GET http://localhost:5000/progress (SSE endpoint for upload progress)



Deploying to Vercel

Install Vercel CLI (if not already installed):
npm install -g vercel


Log in to Vercel:
vercel login


Deploy the Backend:From the backend folder:
vercel


Link to a new project or an existing one.
Use default settings unless custom configuration is needed.
For production deployment, run:vercel --prod




Set Environment Variables in Vercel:

Go to your Vercel project dashboard.
Navigate to Settings > Environment Variables.
Add:
Name: GEMINI_API_KEY
Value: (your Gemini API key)


Redeploy if necessary.


Use the Deployed URL:After deployment, Vercel provides a URL (e.g., https://playpower-backend.vercel.app). Update your frontend to use this URL for API calls.


API Endpoints

GET /: Health check endpoint. Returns a confirmation message.
POST /upload: Upload a PDF file (multipart/form-data, field name: pdf).
Response: { message: string, chunksCount: number, success: boolean }


POST /ask: Ask a question based on the uploaded PDF.
Request Body: { question: string }
Response: { ans: string, citations: number[] }


GET /progress: SSE endpoint for real-time upload progress updates.
Returns: Stream of JSON events { progress: number, complete?: boolean }



Dependencies

express: Web framework for Node.js
cors: Enable cross-origin resource sharing
multer: Handle multipart/form-data for file uploads
pdf-parse: Extract text from PDF files
@google/generative-ai: Google Gemini AI for embeddings and question answering
dotenv: Load environment variables from .env

Notes

File Size Limit: The backend is configured to accept PDF files up to 30MB.
CORS: Currently allows all origins (cors()). For production, restrict to your frontend’s domain (e.g., cors({ origin: "https://playpower-frontend.vercel.app" })).
Vercel Limitations: In-memory storage (vectorStore) is reset between serverless function invocations. For persistent storage, consider integrating a database.
Security: Ensure .env is not committed to Git by including it in .gitignore.

Troubleshooting

Upload Errors: Check Vercel logs for multer or Gemini API errors.
CORS Issues: If the frontend is on a different domain, ensure CORS is configured correctly.
Gemini API Errors: Verify the GEMINI_API_KEY is correct and has sufficient quota.
SSE Issues: Ensure the frontend correctly handles Server-Sent Events and closes connections properly.

License
This project is licensed under the MIT License.