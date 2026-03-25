import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Sparkles, BookOpen, Lightbulb } from "lucide-react";
import aiService from "../../services/aiService";
import toast from "react-hot-toast";
import MarkdownRenderer from "../common/MarkdownRenderer";

const AIAction = () => {
  const { id: documentId } = useParams();

  const [loadingAction, setLoadingAction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [concept, setConcept] = useState("");
  const [expanded, setExpanded] = useState(false);

  // 🔹 Prevent UI overload
  const truncateText = (text, maxLength = 1500) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "\n\n*(Content truncated)*";
  };

  const handleGenerateSummary = async () => {
    setLoadingAction("summary");
    try {
      const { summary } = await aiService.generateSummary(documentId);

      setModalTitle("Generated Summary");
      setModalContent(truncateText(summary));
      setExpanded(false);
      setIsModalOpen(true);
    } catch (error) {
      toast.error("Failed to generate summary.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExplainConcept = async (e) => {
    e.preventDefault();

    if (!concept.trim()) {
      toast.error("Please enter a concept to explain.");
      return;
    }

    setLoadingAction("explain");
    try {
      const { explanation } = await aiService.explainConcept(
        documentId,
        concept
      );

      setModalTitle(`Explanation of "${concept}"`);
      setModalContent(truncateText(explanation));
      setExpanded(false);
      setIsModalOpen(true);
      setConcept("");
    } catch (error) {
      toast.error("Failed to explain concept.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-5 py-5 bg-linear-to-br from-slate-50/50 to-white rounded-2xl backdrop-blur-xl border border-slate-200/60 shadow-sm space-y-6">
        {/* Header */}
        <div className="px-5 py-5 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                AI Assistant
              </h3>
              <p className="text-xs text-slate-500">
                Powered by advanced AI
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Generate Summary */}
          <div className="p-5 bg-linear-to-br from-slate-50/50 to-white rounded-xl hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-slate-900">
                    Generate Summary
                  </h4>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Get a concise summary of the entire document.
                </p>
              </div>

              {loadingAction === "summary" ? (
                <div className="h-11 px-5 flex items-center justify-center bg-gray-200 rounded-xl animate-pulse">
                  Generating...
                </div>
              ) : (
                <button
                  onClick={handleGenerateSummary}
                  className="h-11 px-5 bg-linear-to-r from-emerald-600 to-emerald-500 text-white font-medium rounded-xl shadow-sm hover:shadow transition"
                >
                  Summarize
                </button>
              )}
            </div>
          </div>

          {/* Explain Concept */}
          <div className="p-5 bg-linear-to-br from-slate-50/50 to-white rounded-xl hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                  </div>
                  <h4 className="font-semibold text-slate-900">
                    Explain a Concept
                  </h4>
                </div>

                <p className="text-sm text-slate-600 mb-4">
                  Enter a topic from the document to get a detailed explanation.
                </p>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    placeholder="e.g., React Hooks"
                    className="flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-slate-50 focus:border-emerald-500 focus:bg-white outline-none transition"
                    disabled={loadingAction === "explain"}
                  />

                  <button
                    onClick={handleExplainConcept}
                    disabled={
                      loadingAction === "explain" || !concept.trim()
                    }
                    className="h-11 px-5 bg-linear-to-r from-emerald-600 to-emerald-500 text-white font-medium rounded-xl shadow-sm hover:shadow transition disabled:opacity-50"
                  >
                    {loadingAction === "explain"
                      ? "Loading..."
                      : "Explain"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white max-w-3xl w-full rounded-2xl shadow-xl p-6 relative max-h-[80vh] flex flex-col">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold mb-4">
              {modalTitle}
            </h3>

            {/* Scrollable Content */}
            <div className="prose max-w-none overflow-y-auto pr-2">
              <MarkdownRenderer
                content={
                  expanded
                    ? modalContent
                    : modalContent.slice(0, 1000) + "..."
                }
              />
            </div>

            {/* Read More */}
            {modalContent.length > 1000 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-3 text-emerald-600 font-medium"
              >
                {expanded ? "Show Less" : "Read More"}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AIAction;