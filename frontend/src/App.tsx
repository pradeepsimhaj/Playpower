import axios from "axios";
import { useState, useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import PdfUpload from "./components/PdfUpload";
import AIUserInterfaceWithViewer from "./pages/AIUserInterfaceWithViewer";

interface ResData {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
}

function App() {
  const [res, setRes] = useState<boolean | null>(null);
  const [resData, setResData] = useState<ResData>({});
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showComplete, setShowComplete] = useState<boolean>(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    if (isUploading) {
      // Connect to SSE endpoint
      eventSource = new EventSource("https://backend-wheat-six-35.vercel.app/progress");

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setUploadProgress(data.progress);

        if (data.complete) {
          setShowComplete(true);
          setTimeout(() => {
            setShowComplete(false);
            setIsUploading(false);
            setRes(true); // Render viewer page
            eventSource?.close();
          }, 1500); // 1.5s for completion popup
        }
      };

      eventSource.onerror = () => {
        console.error("SSE error occurred");
        eventSource?.close();
        setIsUploading(false);
        setRes(false);
      };
    }

    // Cleanup on unmount or when isUploading changes
    return () => {
      eventSource?.close();
    };
  }, [isUploading]);

  const handleFile = async (file: File) => {
    const formData = new FormData();
    formData.append("pdf", file);

    setIsUploading(true);
    setUploadProgress(0);
    setPdfFile(file);

    try {
      const response = await axios.post(
        "https://backend-wheat-six-35.vercel.app/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response?.data?.success) {
        setResData(response.data);
      } else {
        setIsUploading(false);
        setRes(false);
      }
    } catch (err) {
      console.error("Failed to upload PDF:", err);
      setIsUploading(false);
      setRes(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {res === true && pdfFile ? (
        /* ---------- VIEWER PAGE ---------- */
        <div className="w-full">
          <AIUserInterfaceWithViewer
            resData={{ ...resData, message: resData.message ?? "" }}
            pdfFile={pdfFile}
          />
        </div>
      ) : (
        /* ---------- UPLOAD / PROGRESS PAGE ---------- */
        <>
          {isUploading ? (
            <div className="flex flex-col items-center space-y-4 w-80">
              <LoaderCircle className="animate-spin text-blue-600" size={40} />
              <p className="text-blue-700 font-medium">
                Processing your PDF… {uploadProgress}%
              </p>

              {/* Progress bar */}
              <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>

              {/* Upload-complete pop-up */}
              {showComplete && (
                <div className="mt-2 px-4 py-2 rounded bg-green-600 text-white shadow">
                  PDF processing complete!
                </div>
              )}
            </div>
          ) : (
            <PdfUpload onFileSelect={handleFile} />
          )}
        </>
      )}
    </div>
  );
}

export default App;