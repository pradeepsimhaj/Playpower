Playpower Frontend
This is the frontend for the Playpower application, built with Vite, React, and TypeScript. It provides a user interface for uploading PDF files, tracking upload progress in real-time using Server-Sent Events (SSE), and interacting with a PDF viewer and AI-powered question-answering system. The frontend communicates with a backend API deployed on Vercel.
Features

PDF Upload: Allows users to upload PDF files (up to 30MB, as supported by the backend).
Real-Time Progress: Displays upload progress using SSE from the backend.
PDF Viewer: Renders the uploaded PDF and enables question-answering functionality.
Responsive Design: Built with Tailwind CSS for a modern and responsive UI.

Folder Structure
playpower/frontend/
├── node_modules/          # Node.js dependencies
├── public/               # Static assets (e.g., index.html)
├── src/                  # Source code
│   ├── assets/           # Static assets (e.g., react.svg)
│   ├── components/       # Reusable components (e.g., PdfUpload.tsx)
│   ├── hooks/            # Custom hooks (e.g., useType.tsx)
│   ├── pages/            # Page components (e.g., AIUserInterfaceWithViewer.tsx)
│   ├── App.css           # Global styles
│   ├── App.tsx           # Main App component
│   ├── index.css         # Base styles
│   ├── main.tsx          # Entry point for React
├── vite-env.d.ts         # TypeScript environment definitions for Vite
├── .gitignore            # Git ignore file
├── eslint.config.js      # ESLint configuration
├── package.json          # Project metadata and dependencies
├── package-lock.json     # Dependency lock file
├── README.md             # Project documentation
├── tsconfig.app.json     # TypeScript configuration for the app
├── tsconfig.json         # Base TypeScript configuration
├── tsconfig.node.json    # TypeScript configuration for Node

Prerequisites

Node.js: Version 18.x or higher
npm: Version 9.x or higher
Vercel CLI: For deployment (optional for local development)
Backend URL: The deployed backend URL (https://backend-wheat-six-35.vercel.app/)
Frontend URL: The deployed frontend URL (https://frontend-phi-six-86.vercel.app/)

Installation

Clone the Repository:
(https://github.com/pradeepsimhaj/Playpower.git)
cd frontend


Install Dependencies:
npm install


Set Up Environment Variables:Create a .env file in the frontend folder with the following (optional, if needed for API endpoints):
VITE_BACKEND_URL=https://backend-wheat-six-35.vercel.app/

Replace the URL with your deployed backend URL. If not using a .env file, update the API calls in App.tsx manually.


Running Locally

Start the Vite development server:
npm run dev

The app will be available at http://localhost:5173 (or the port specified by Vite).

Test the Application:

Upload a PDF file using the PdfUpload component.
Monitor the real-time upload progress.
Navigate to the viewer page (AIUserInterfaceWithViewer) after successful upload.



Deploying to Vercel

Install Vercel CLI (if not already installed):
npm install -g vercel


Log in to Vercel:
vercel login


Deploy the Frontend:From the frontend folder:
vercel


Link to a new project or an existing one.
Use default settings (Vite will be auto-detected).
For production deployment, run:vercel --prod




Set Environment Variables in Vercel (if using .env):

Go to your Vercel project dashboard.
Navigate to Settings > Environment Variables.
Add:
Name: VITE_BACKEND_URL
Value: https://backend-wheat-six-35.vercel.app/


Redeploy if necessary.


Use the Deployed URL:After deployment, Vercel provides a URL (e.g., https://playpower-frontend.vercel.app). Share this URL with users.


API Integration
The frontend communicates with the backend at the following endpoints:

POST /upload: Uploads a PDF file.
GET /progress: Streams upload progress via SSE.
POST /ask: Sends a question to get an answer based on the PDF content.

Update the App.tsx file with the deployed backend URL (https://backend-wheat-six-35.vercel.app/) if not using environment variables.
Dependencies

react: JavaScript library for building user interfaces
react-dom: DOM-specific methods for React
axios: HTTP client for API requests
lucide-react: Icons for the UI
tailwindcss: CSS framework for styling
vite: Next-generation frontend tooling

Development Scripts

npm run dev: Starts the development server.
npm run build: Builds the app for production.
npm run lint: Runs ESLint to check for code issues.
npm run preview: Previews the production build locally.

Notes

Backend Dependency: Ensure the backend is deployed and accessible at the specified URL.
File Size Limit: The backend supports up to 30MB PDF files; the frontend reflects this limit.
CORS: The backend must allow CORS from the frontend’s domain (configured in the backend’s server.js).
TypeScript: The project uses TypeScript for type safety; ensure tsconfig files are correctly configured.

Troubleshooting

Build Errors: Check tsconfig.json or package.json for missing dependencies.
API Errors: Verify the backend URL and CORS settings.
SSE Issues: Ensure the backend’s /progress endpoint is reachable and the frontend handles events correctly.
Vercel Deployment: Review Vercel logs for build or runtime errors.

License
This project is licensed under the MIT License.