import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

import quizService from "../../services/quizService";
import aiService from "../../services/aiService";
import Spinner from "../common/Spinner";
import Modal from "../common/Modal";
import QuizCard from "./QuizCard";
import EmptyState from "../common/EmptyState";

const QuizManager = ({ documentId }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);

  /* ================= FETCH QUIZZES ================= */
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizService.getQuizzesForDocument(documentId);
      setQuizzes(response.data);
    } catch (error) {
      toast.error("Failed to fetch quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) fetchQuizzes();
  }, [documentId]);

  /* ================= DELETE QUIZ ================= */
  const handleDelete = async (quiz) => {
    try {
      await quizService.deleteQuiz(quiz._id);
      toast.success("Quiz deleted successfully");

      // remove from UI instantly
      setQuizzes((prev) =>
        prev.filter((q) => q._id !== quiz._id)
      );
    } catch (error) {
      toast.error("Failed to delete quiz");
    }
  };

  /* ================= GENERATE QUIZ ================= */
  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setGenerating(true);

    try {
      await aiService.generateQuiz(documentId, { numQuestions });
      toast.success("Quiz generated successfully!");
      setIsGenerateModalOpen(false);
      fetchQuizzes();
    } catch (error) {
      toast.error(error.message || "Failed to generate quiz");
    } finally {
      setGenerating(false);
    }
  };

  /* ================= RENDER ================= */
  const renderContent = () => {
    if (loading) return <Spinner />;

    if (quizzes.length === 0) {
      return (
        <EmptyState
          title="No Quizzes Yet"
          description="Generate a quiz from your document to test your knowledge."
          buttonText="Generate Quiz"
          onActionClick={() => setIsGenerateModalOpen(true)}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {quizzes.map((quiz) => (
          <QuizCard
            key={quiz._id}
            quiz={quiz}
            onDelete={handleDelete} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
      
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <Plus size={16} />
          Generate Quiz
        </button>
      </div>

      {renderContent()}

      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate New Quiz"
      >
        <form onSubmit={handleGenerateQuiz} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Number of Questions
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={numQuestions}
              onChange={(e) =>
                setNumQuestions(
                  Math.max(1, parseInt(e.target.value) || 1)
                )
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(false)}
              disabled={generating}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={generating}
              className="px-5 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QuizManager;