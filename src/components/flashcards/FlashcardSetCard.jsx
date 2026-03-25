import React from 'react';
import { useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, TrendingUp } from "lucide-react";
import moment from "moment";

const BRAND = "#0BAF8A";
const BRAND_DARK = "#099972";

const FlashcardSetCard = ({ flashcardSet }) => {
  const navigate = useNavigate();

  const handleStudyNow = () => {
    navigate(`/documents/${flashcardSet.documentId._id}/flashcards`);
  };

  const reviewedCount = flashcardSet.cards.filter(card => card.lastReviewed).length;
  const totalCards = flashcardSet.cards.length;
  const progressPercentage = totalCards > 0 ? Math.round((reviewedCount / totalCards) * 100) : 0;

  return (
    <div
      className="group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200 transition-all duration-300 rounded-xl p-4 cursor-pointer"
      style={{ "--brand": BRAND }}
      onClick={handleStudyNow}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${BRAND}80`)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
    >
      {/* Icon and Title */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          {/* Brand-tinted icon container */}
          <div
            className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${BRAND}18` }}
          >
            <BookOpen className="w-6 h-6" style={{ color: BRAND }} strokeWidth={2} />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className="text-base font-semibold text-slate-900 line-clamp-2 mb-1"
              title={flashcardSet?.documentId?.title}
            >
              {flashcardSet?.documentId?.title}
            </h3>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Created {moment(flashcardSet.createdAt).fromNow()}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 pt-2">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-sm font-semibold text-slate-800">
              {totalCards} {totalCards === 1 ? 'Card' : 'Cards'}
            </span>
          </div>

          {reviewedCount > 0 && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg"
              style={{ backgroundColor: `${BRAND}12`, borderColor: `${BRAND}40` }}
            >
              <TrendingUp className="w-3.5 h-3.5" style={{ color: BRAND }} strokeWidth={2.5} />
              <span className="text-sm font-semibold" style={{ color: BRAND }}>
                {progressPercentage}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {totalCards > 0 && (
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Progress</span>
            <span className="text-xs font-semibold text-slate-700">
              {reviewedCount}/{totalCards} reviewed
            </span>
          </div>
          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: BRAND,
              }}
            />
          </div>
        </div>
      )}

      {/* Study Button */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStudyNow();
          }}
          className="w-full h-11 text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2 font-medium"
          style={{ backgroundColor: BRAND }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_DARK)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
        >
          <Sparkles className="w-4 h-4" strokeWidth={2.5} />
          Study Now
        </button>
      </div>
    </div>
  );
};

export default FlashcardSetCard;