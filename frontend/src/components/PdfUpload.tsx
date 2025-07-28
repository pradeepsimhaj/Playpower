import { useRef } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { Upload } from "lucide-react";

interface PDFUploadBoxProps {
  onFileSelect: (file: File) => void;
}

export default function PdfUpload({ onFileSelect }: PDFUploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      onFileSelect(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      onFileSelect(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="bg-white rounded-2xl shadow-md p-8 cursor-pointer transition hover:shadow-xl flex flex-col items-center justify-center border border-dashed border-purple-400 w-96 text-center"
      >
        <div className="bg-purple-100 rounded-full p-3 mb-4">
          <Upload className="text-black-600 w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold text-blue-800">
          Upload PDF to start chatting
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Click or drag and drop your file here
        </p>
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <p className="text-xs text-black-400 mt-2">
        The maximum file size should not be greater than 30MB.</p>
      </div>
    </div>
  );
}
