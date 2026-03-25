import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import quizService from "../../services/quizService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  BookOpen,
} from "lucide-react";

const QuizResultPage = () => {
  const { quizId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await quizService.getQuizResults(quizId);
        setResults(response);
      } catch (error) {
        toast.error("Failed to fetch quiz results.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!results || !results.data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-600 text-lg">Quiz results not found.</p>
      </div>
    );
  }

  const {
    data: { quiz, results: detailedResults },
  } = results;

  const score = quiz.score;
  const totalQuestions = detailedResults.length;
  const correctAnswers = detailedResults.filter(
    (r) => r.isCorrect
  ).length;
  const incorrectAnswers = totalQuestions - correctAnswers;

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-500";
    return "text-rose-500";
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return "Outstanding! 🎉";
    if (score >= 80) return "Great job! 🎊";
    if (score >= 70) return "Good work! 👏";
    if (score >= 60) return "Not bad! 👍";
    return "Keep practicing! 💪";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* Back Button */}
      <Link
        to={`/documents/${quiz.document_id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Document
      </Link>

      <PageHeader title={`${quiz.title || "Quiz"} Results`} />

      {/* Score Card */}
      <div className="bg-white border rounded-2xl shadow-sm p-8 text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-emerald-100 p-4 rounded-2xl">
            <Trophy className="w-7 h-7 text-emerald-600" />
          </div>
        </div>

        <p className="text-sm uppercase text-slate-500 font-semibold">
          Your Score
        </p>

        <h2 className={`text-5xl font-bold ${getScoreColor(score)}`}>
          {score}%
        </h2>

        <p className="text-slate-600 font-medium">
          {getScoreMessage(score)}
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-4 pt-4">
          <div className="px-4 py-2 bg-slate-100 rounded-full flex items-center gap-2 text-sm">
            <Target className="w-4 h-4" />
            {totalQuestions} Total
          </div>

          <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            {correctAnswers} Correct
          </div>

          <div className="px-4 py-2 bg-rose-100 text-rose-700 rounded-full flex items-center gap-2 text-sm">
            <XCircle className="w-4 h-4" />
            {incorrectAnswers} Incorrect
          </div>
        </div>
      </div>

      {/* Detailed Review */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">
            Detailed Review
          </h3>
        </div>

        <div className="space-y-6">
          {detailedResults.map((result, index) => {
            const userAnswerIndex = result.options.findIndex(
              (opt) => opt === result.selectedAnswer
            );

            const correctAnswerIndex =
              result.options.findIndex(
                (opt) => opt === result.correctAnswer
              );

            return (
              <div
                key={index}
                className="bg-white border rounded-xl p-6 shadow-sm space-y-4"
              >
                {/* Question Header */}
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-slate-100 px-3 py-1 rounded-full font-medium">
                    Question {index + 1}
                  </span>

                  {result.isCorrect ? (
                    <CheckCircle2 className="text-emerald-600" />
                  ) : (
                    <XCircle className="text-rose-600" />
                  )}
                </div>

                {/* Question */}
                <h4 className="text-base font-semibold text-slate-900">
                  {result.question}
                </h4>

                {/* Options */}
                <div className="space-y-3">
                  {result.options.map((option, optIndex) => {
                    const isCorrectOption =
                      optIndex === correctAnswerIndex;
                    const isUserAnswer =
                      optIndex === userAnswerIndex;
                    const isWrongAnswer =
                      isUserAnswer && !result.isCorrect;

                    return (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-lg border text-sm flex justify-between items-center
                          ${
                            isCorrectOption
                              ? "bg-emerald-100 border-emerald-400 text-emerald-800"
                              : isWrongAnswer
                              ? "bg-rose-100 border-rose-400 text-rose-700"
                              : "bg-slate-50 border-slate-200"
                          }`}
                      >
                        <span>{option}</span>

                        {isCorrectOption && (
                          <span className="text-xs font-semibold">
                            Correct
                          </span>
                        )}

                        {isWrongAnswer && (
                          <span className="text-xs font-semibold">
                            Your Answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {result.explanation && (
                  <div className="bg-slate-50 border rounded-lg p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                      Explanation
                    </p>
                    <p className="text-sm text-slate-700">
                      {result.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Return Button */}
      <div className="flex justify-center pt-6">
        <Link to={`/documents/${quiz.document_id}`}>
          <button className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md transition">
            Return to Document
          </button>
        </Link>
      </div>
    </div>
  );
};

export default QuizResultPage;