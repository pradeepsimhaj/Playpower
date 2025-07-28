import { useState, useEffect, useRef} from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import axios from "axios";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { useType } from "../hooks/useType";

interface AIUserInterfaceWithViewerProps {
  pdfFile: File | null;
  resData: {
    message: string;
  };
}

interface ChatMessage {
  sender: "user" | "ai";
  message: string;
  [key: string]: unknown; // Allow additional properties for AI messages
}

export default function AIUserInterfaceWithViewer({ pdfFile, resData }: AIUserInterfaceWithViewerProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [typingStopped, setTypingStopped] = useState<boolean>(false);
  const [defaultMessage, setDefaultMessage] = useState<string>(resData.message);
  const [pdfExpanded, setPdfExpanded] = useState<boolean>(false);

  const pluginInstance = defaultLayoutPlugin();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef<boolean>(true);

  useEffect(() => {
    const existing = localStorage.getItem("chatHistory");
    if (existing) {
      setChatHistory(JSON.parse(existing));
      isFirstLoad.current = false;
      setDefaultMessage("Please ask something about your PDF.");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    const handleUnload = () => {
      localStorage.removeItem("chatHistory");
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  useEffect(() => {
    if (!pdfFile) {
      setFileUrl(null);
      return;
    }
    const url = URL.createObjectURL(pdfFile);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pdfFile]);

  const lastMsg = chatHistory[chatHistory.length - 1];
  const typedMessage = useType(
    lastMsg?.sender === "ai" && !loading && !typingStopped ? lastMsg.message : ""
  );

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [typedMessage, chatHistory]);

  const handleSend = async () => {
    if (!input.trim()) return;

    setTypingStopped(false);

    const userMsg: ChatMessage = { sender: "user", message: input.trim() };
    const placeholderAI: ChatMessage = { sender: "ai", message: "Thinking..." };
    const updatedChat = [...chatHistory, userMsg, placeholderAI];

    setChatHistory(updatedChat);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("https://backend-wheat-six-35.vercel.app/ask", {
        question: input,
      });

      const aiData: ChatMessage = {
        sender: "ai",
        message: res.data.ans || "No response found.",
        ...(res.data || {}),
      };

      const finalChat = [...chatHistory, userMsg, aiData];
      setChatHistory(finalChat);
    } catch (err) {
      const errorMsg: ChatMessage = {
        sender: "ai",
        message: "Something went wrong. Try again.",
      };
      const finalChat = [...chatHistory, userMsg, errorMsg];
      setChatHistory(finalChat);
    } finally {
      setLoading(false);
    }
  };

  const formatAIMessage = (msg: string) => {
    const paragraphs = msg.split("\n").filter((line) => line.trim() !== "");
    return paragraphs.map((para, idx) => (
      <p key={idx} className="mb-2 text-sm text-gray-800 leading-relaxed">
        {para}
      </p>
    ));
  };

  const handleStopTyping = () => {
    setTypingStopped(true);
  };

  const handleClearChat = () => {
    setChatHistory([]);
    localStorage.removeItem("chatHistory");
    setTypingStopped(false);
    setDefaultMessage("Please ask something about your PDF.");
    isFirstLoad.current = false;
  };

  const togglePdfExpand = () => {
    setPdfExpanded((prev) => !prev);
  };

  return (
    <div className="flex flex-col md:flex-row h-[96.7vh]">
      <div
        className={`w-full lg:w-1/2 bg-white p-4 flex flex-col
        ${pdfExpanded ? "h-[60vh]" : "h-[20vh] md:h-auto"}
        md:h-auto
        transition-[height] duration-300 ease-in-out
        overflow-hidden`}
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold text-gray-800">PDF Viewer</h2>
          <button
            onClick={togglePdfExpand}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded md:hidden"
            aria-label={pdfExpanded ? "Minimize PDF viewer" : "Expand PDF viewer"}
          >
            {pdfExpanded ? "Minimize" : "Expand"}
          </button>
        </div>

        {fileUrl ? (
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer fileUrl={fileUrl} plugins={[pluginInstance]} />
          </Worker>
        ) : (
          <p className="text-center text-gray-500 mt-10">No PDF selected.</p>
        )}
      </div>

      <div
        className={`w-full md:w-1/2 border-t md:border-t-0 md:border-l border-gray-300 p-4 flex flex-col
        ${pdfExpanded ? "h-[calc(100vh-60vh)]" : "h-[calc(100vh-30vh)] md:h-auto"}
        transition-[height] duration-300 ease-in-out
        overflow-hidden`}
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold text-gray-800">AI Chat</h2>
          <div className="space-x-4">
            <button
              onClick={handleStopTyping}
              className="text-md px-5 py-3 bg-red-500 text-white rounded hover:bg-green-600"
              disabled={typingStopped}
            >
              Stop
            </button>
            <button
              onClick={handleClearChat}
              className="text-md px-5 py-3 bg-gray-600 text-white rounded hover:bg-green-700"
            >
              Clear Chat
            </button>
          </div>
        </div>

        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto bg-gray-100 rounded p-3 space-y-4"
        >
          {chatHistory.length === 0 ? (
            <h1 className="text-black bg-blue-200 border border-blue-700 rounded-sm py-4 px-2">
              {defaultMessage}
            </h1>
          ) : (
            chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl px-6 py-4 rounded-lg text-md ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-300 rounded-bl-none"
                  }`}
                >
                  {msg.sender === "ai" ? (
                    msg.message === "Thinking..." ? (
                      <span className="italic text-gray-400">
                        The AI is responding..., Please wait for a few seconds.
                      </span>
                    ) : index === chatHistory.length - 1 && !loading && !typingStopped ? (
                      formatAIMessage(typedMessage)
                    ) : (
                      formatAIMessage(msg.message)
                    )
                  ) : (
                    msg.message
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 space-x-2 flex">
          <input
            type="text"
            placeholder="Ask about the document..."
            className="text-md flex-1 p-2 border rounded-l focus:outline-none"
            value={input}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />
          <button
            className={`text-md px-6 py-4 rounded-r text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-black-700"
            }`}
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
