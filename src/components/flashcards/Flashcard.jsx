import { useState, useEffect } from "react";
import { Star, RotateCcw } from "lucide-react";

const Flashcard = ({ flashcard, onToggleStar }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset to front whenever the card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [flashcard._id]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="w-full max-w-md h-72 mx-auto" style={{ perspective: "1000px" }}>
      <div
        onClick={handleFlip}
        className="relative w-full h-full transition-transform duration-500 cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ================= FRONT (Question) ================= */}
        <div
          className="absolute inset-0 bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
          }}
        >
          <div className="flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(flashcard._id);
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition ${
                flashcard.isStarred
                  ? "bg-yellow-100 text-yellow-500"
                  : "bg-slate-100 text-slate-400 hover:bg-slate-200"
              }`}
            >
              <Star size={20} strokeWidth={2} fill={flashcard.isStarred ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-lg font-semibold text-slate-700">{flashcard.question}</p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <RotateCcw size={16} />
            <span>Click to reveal answer</span>
          </div>
        </div>

        {/* ================= BACK (Answer) ================= */}
        <div
          className="absolute inset-0 text-white rounded-2xl shadow-lg p-6 flex flex-col justify-between bg-gradient-to-r from-emerald-500 to-teal-500"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(flashcard._id);
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition ${
                flashcard.isStarred
                  ? "bg-yellow-400 text-white"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <Star size={20} strokeWidth={2} fill={flashcard.isStarred ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-lg font-medium">{flashcard.answer}</p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-white/80">
            <RotateCcw size={16} />
            <span>Click to see question</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
