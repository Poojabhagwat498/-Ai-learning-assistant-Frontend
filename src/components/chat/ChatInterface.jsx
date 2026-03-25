import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import aiService from "../../services/aiService";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../common/Spinner";
import MarkdownRenderer from "../common/MarkdownRenderer";

const ChatInterface = () => {
  const { id: documentId } = useParams();
  const { user } = useAuth();

  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setInitialLoading(true);
        const response = await aiService.getChatHistory(documentId);
        setHistory(response.data || []);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    if (documentId) fetchChatHistory();
  }, [documentId]);

  useEffect(() => {
    scrollToBottom();
  }, [history, loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await aiService.chat(documentId, message);
      setHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.data.answer,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.role === "user";

    return (
      <div
        key={index}
        className={`flex items-end gap-2 mb-4 ${
          isUser ? "justify-end" : "justify-start"
        }`}
      >
        {/* AI Avatar */}
        {!isUser && (
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Sparkles size={16} />
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow
            ${
              isUser
                ? "bg-emerald-600 text-white rounded-br-none"
                : "bg-slate-100 text-slate-800 rounded-bl-none"
            }`}
        >
          {isUser ? (
            <p>{msg.content}</p>
          ) : (
            <MarkdownRenderer content={msg.content} />
          )}
        </div>

        {/* User Avatar */}
        {isUser && (
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-700 font-semibold text-sm">
            {user?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}
      </div>
    );
  };

  /* ---------- INITIAL LOADING ---------- */
  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
        <MessageSquare className="mb-3" size={32} />
        <Spinner />
        <p className="mt-2 text-sm">Loading chat history...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[75vh] bg-white rounded-lg border">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <MessageSquare size={36} className="mb-3" />
            <h3 className="font-semibold">Start a conversation</h3>
            <p className="text-sm">Ask me anything about the document!</p>
          </div>
        ) : (
          history.map(renderMessage)
        )}

        {loading && (
          <div className="flex items-center gap-2 text-slate-500 text-sm mt-2">
            <Sparkles size={16} className="animate-pulse" />
            AI is thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="flex-1 rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
