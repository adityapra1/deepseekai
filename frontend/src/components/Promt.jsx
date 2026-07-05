import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ArrowUp, Globe, Bot, Zap, Gem, Image as ImageIcon } from "lucide-react"; 
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow as codeTheme } from "react-syntax-highlighter/dist/esm/styles/prism";

// 1. Config se URL import karein
import { BACKEND_URL } from "../utils/utils"; 

function Promt() {
  const [inputValue, setInputValue] = useState("");
  const [typeMessage, setTypeMessage] = useState("");
  const [logoError, setLogoError] = useState(false);
  const [promt, setPromt] = useState([]);
  const [loading, setLoading] = useState(false);
  const promtEndRef = useRef();

  const [isDeepThink, setIsDeepThink] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [chatMode, setChatMode] = useState("Instant");

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        const storedPromt = localStorage.getItem(`promtHistory_${user._id}`);
        if (storedPromt) {
          setPromt(JSON.parse(storedPromt));
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  }, []);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        localStorage.setItem(`promtHistory_${user._id}`, JSON.stringify(promt));
        window.dispatchEvent(new Event("chatUpdated"));
      }
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  }, [promt]);

  useEffect(() => {
    promtEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [promt, loading]);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setInputValue("");
    setTypeMessage(trimmed);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      // 2. Yahan BACKEND_URL use kiya hai
      const { data } = await axios.post(
        `${BACKEND_URL}/deepseekai/promt`, 
        { content: trimmed },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      setPromt((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        { role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      console.error("API Error:", error);
      setPromt((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        {
          role: "assistant",
          content: "❌ Something went wrong with the AI response.",
        },
      ]);
    } finally {
      setLoading(false);
      setTypeMessage(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Scrollbar Styling */}
      <style>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background-color: #4b5563; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background-color: #6b7280; }
      `}</style>

      <div className="flex flex-col h-full items-center justify-between flex-1 w-full px-4 pb-4 md:pb-8">
        
        {/* Greeting Section */}
        <div className="mt-8 md:mt-12 text-center flex flex-col items-center flex-shrink-0">
          <div className="flex items-center justify-center gap-3 mb-6">
            {!logoError ? (
              <img 
                src="http://localhost:5174/logo.png" 
                alt="DeepSeek Logo" 
                className="h-6 md:h-8"
                onError={(e) => { setLogoError(true); e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                DS
              </div>
            )}
            <h1 className="text-2xl md:text-3xl font-semibold text-white">
              Start chatting with {chatMode}
            </h1>
          </div>

          <div className="flex bg-[#2f2f2f] rounded-full p-1 border border-gray-700">
            <button onClick={() => setChatMode("Instant")} className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors ${chatMode === "Instant" ? "bg-[#3b3b4f] text-blue-400" : "text-gray-300 hover:text-white"}`}>
              <Zap className="w-4 h-4" /> Instant
            </button>
            <button onClick={() => setChatMode("Expert")} className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors ${chatMode === "Expert" ? "bg-[#3b3b4f] text-blue-400" : "text-gray-300 hover:text-white"}`}>
              <Gem className="w-4 h-4" /> Expert
            </button>
            <button onClick={() => setChatMode("Vision")} className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors ${chatMode === "Vision" ? "bg-[#3b3b4f] text-blue-400" : "text-gray-300 hover:text-white"}`}>
              <ImageIcon className="w-4 h-4" /> Vision
            </button>
          </div>
        </div>

        {/* Chat Box */}
        <div className="w-full max-w-4xl flex-1 overflow-y-auto mt-6 mb-4 space-y-4 px-2 pr-4">
          {promt.map((msg, index) => (
            <div key={index} className={`w-full flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" ? (
                <div className="w-full bg-[#232323] text-white rounded-xl px-4 py-3 text-sm whitespace-pre-wrap">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="w-[30%] bg-blue-600 text-white rounded-xl px-4 py-3 text-sm whitespace-pre-wrap self-start">
                  {msg.content}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start w-full">
              <div className="bg-[#2f2f2f] text-white px-4 py-3 rounded-xl text-sm animate-pulse">🤖Loading...</div>
            </div>
          )}
          <div ref={promtEndRef} />
        </div>

        {/* Input Box */}
        <div className="w-full max-w-4xl relative flex-shrink-0">
          <div className="bg-[#2f2f2f] rounded-[2rem] px-4 md:px-6 py-6 md:py-8 shadow-md">
            <input
              type="text"
              placeholder="💬 Message DeepSeek"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent w-full text-white placeholder-gray-400 text-base md:text-lg outline-none"
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setIsDeepThink(!isDeepThink)} className={`flex items-center gap-2 border text-sm px-3 py-1.5 rounded-full transition-colors ${isDeepThink ? "border-blue-500 text-blue-400 bg-blue-900/20" : "border-gray-600 text-gray-300"}`}>
                  <Bot className="w-4 h-4" /> DeepThink
                </button>
                <button onClick={() => setIsSearch(!isSearch)} className={`flex items-center gap-2 border text-sm px-3 py-1.5 rounded-full transition-colors ${isSearch ? "border-blue-500 text-blue-400 bg-blue-900/20" : "border-gray-600 text-gray-300"}`}>
                  <Globe className="w-4 h-4" /> Search
                </button>
              </div>
              <button onClick={handleSend} disabled={loading} className="bg-blue-600 hover:bg-blue-500 p-2 rounded-full text-white transition">
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default Promt;