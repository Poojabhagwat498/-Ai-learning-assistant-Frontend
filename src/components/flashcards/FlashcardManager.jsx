import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowLeft,
  Brain,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";

import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import Spinner from "../common/Spinner";
import Modal from "../common/Modal";
import Flashcard from "./Flashcard";

const BRAND = "#0BAF8A";
const BRAND_DARK = "#099972";

const brandBtnStyle = { backgroundColor: BRAND, transition: "background-color 0.2s" };
const brandHover = {
  onMouseEnter: (e) => (e.currentTarget.style.backgroundColor = BRAND_DARK),
  onMouseLeave: (e) => (e.currentTarget.style.backgroundColor = BRAND),
};

const FlashcardManager = ({ documentId }) => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);

  /* ================= FETCH ================= */
  const fetchFlashcardSets = async () => {
    setLoading(true);
    try {
      const response = await flashcardService.getFlashcardsForDocument(documentId);
      setFlashcardSets(response.data);
    } catch (error) {
      toast.error("Failed to fetch flashcard sets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) fetchFlashcardSets();
  }, [documentId]);

  /* ================= GENERATE ================= */
  const handleGenerateFlashcards = async () => {
    setGenerating(true);
    try {
      await aiService.generateFlashcards(documentId);
      toast.success("Flashcards generated successfully!");
      fetchFlashcardSets();
    } catch (error) {
      toast.error(error.message || "Failed to generate flashcards.");
    } finally {
      setGenerating(false);
    }
  };

  /* ================= STAR ================= */
  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);
      const updatedSets = flashcardSets.map((set) => {
        if (set._id === selectedSet._id) {
          return {
            ...set,
            cards: set.cards.map((card) =>
              card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
            ),
          };
        }
        return set;
      });
      setFlashcardSets(updatedSets);
      setSelectedSet(updatedSets.find((set) => set._id === selectedSet._id));
      toast.success("Star updated!");
    } catch (error) {
      toast.error("Failed to update star.");
    }
  };

  /* ================= NAVIGATION ================= */
  const handleNextCard = () => {
    if (!selectedSet) return;
    setCurrentCardIndex((prev) => (prev + 1) % selectedSet.cards.length);
  };

  const handlePrevCard = () => {
    if (!selectedSet) return;
    setCurrentCardIndex(
      (prev) => (prev - 1 + selectedSet.cards.length) % selectedSet.cards.length
    );
  };

  /* ================= DELETE ================= */
  const handleDeleteRequest = (e, set) => {
    e.stopPropagation();
    setSetToDelete(set);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!setToDelete) return;
    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(setToDelete._id);
      setFlashcardSets((prev) => prev.filter((set) => set._id !== setToDelete._id));
      toast.success("Flashcard set deleted.");
      setIsDeleteModalOpen(false);
      setSetToDelete(null);
    } catch (error) {
      toast.error("Failed to delete set.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSelectSet = (set) => {
    setSelectedSet(set);
    setCurrentCardIndex(0);
  };

  /* ================= VIEWER ================= */
  const renderFlashcardViewer = () => {
    const currentCard = selectedSet.cards[currentCardIndex];

    return (
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back link */}
        <button
          onClick={() => setSelectedSet(null)}
          className="flex items-center gap-2 font-medium transition"
          style={{ color: BRAND }}
          onMouseEnter={(e) => (e.currentTarget.style.color = BRAND_DARK)}
          onMouseLeave={(e) => (e.currentTarget.style.color = BRAND)}
        >
          <ArrowLeft size={18} />
          Back to Sets
        </button>

        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-slate-200">
          <Flashcard flashcard={currentCard} onToggleStar={handleToggleStar} />
        </div>

        <div className="flex items-center justify-between">
          {/* Previous */}
          <button
            onClick={handlePrevCard}
            className="px-5 py-3 bg-white shadow-md rounded-xl flex items-center gap-2 hover:shadow-lg transition border"
            style={{ color: BRAND, borderColor: `${BRAND}40` }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = BRAND;
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
              e.currentTarget.style.color = BRAND;
            }}
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          {/* Counter */}
          <span
            className="text-sm font-semibold tabular-nums px-4 py-1.5 rounded-full"
            style={{ color: BRAND, backgroundColor: `${BRAND}18` }}
          >
            {currentCardIndex + 1} / {selectedSet.cards.length}
          </span>

          {/* Next */}
          <button
            onClick={handleNextCard}
            className="px-5 py-3 bg-white shadow-md rounded-xl flex items-center gap-2 hover:shadow-lg transition border"
            style={{ color: BRAND, borderColor: `${BRAND}40` }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = BRAND;
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
              e.currentTarget.style.color = BRAND;
            }}
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  /* ================= SET LIST ================= */
  const renderSetList = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      );
    }

    if (flashcardSets.length === 0) {
      return (
        <div className="text-center py-24 space-y-6">
          <Brain size={70} className="mx-auto opacity-70" style={{ color: BRAND }} />
          <h3 className="text-2xl font-bold text-slate-800">No Flashcards Yet</h3>
          <button
            onClick={handleGenerateFlashcards}
            disabled={generating}
            className="px-8 py-4 text-white rounded-2xl shadow-xl hover:scale-105 transition transform disabled:opacity-50"
            style={brandBtnStyle}
            {...brandHover}
          >
            {generating ? "Generating..." : "Generate Flashcards"}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-10">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Your Flashcard Sets</h3>
            <p className="text-slate-500 mt-1">
              {flashcardSets.length} {flashcardSets.length === 1 ? "set" : "sets"} available
            </p>
          </div>

          {/* New Set button */}
          <button
            onClick={handleGenerateFlashcards}
            disabled={generating}
            className="flex items-center gap-2 text-white px-6 py-3 rounded-2xl shadow-lg transition disabled:opacity-50"
            style={brandBtnStyle}
            {...brandHover}
          >
            <Plus size={18} />
            {generating ? "Generating..." : "New Set"}
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {flashcardSets.map((set) => (
            <div
              key={set._id}
              onClick={() => handleSelectSet(set)}
              className="relative group bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition duration-300 cursor-pointer border border-slate-100"
              style={{ "--hover-border": BRAND }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${BRAND}60`)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
            >
              <button
                onClick={(e) => handleDeleteRequest(e, set)}
                className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition"
              >
                <Trash2 size={18} />
              </button>

              <div className="flex items-center gap-4">
                {/* Brain icon — brand colored */}
                <div
                  className="w-12 h-12 flex items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${BRAND}18`, color: BRAND }}
                >
                  <Brain size={22} />
                </div>

                <div>
                  <h4 className="font-semibold text-lg text-slate-800">Flashcard Set</h4>
                  <p className="text-sm text-slate-500">
                    {moment(set.createdAt).format("MMM D, YYYY")}
                  </p>
                </div>
              </div>

              {/* Card count — brand colored */}
              <div className="mt-6 text-sm font-medium" style={{ color: BRAND }}>
                {set.cards.length} {set.cards.length === 1 ? "card" : "cards"}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-8">
        {selectedSet ? renderFlashcardViewer() : renderSetList()}

        {/* FAB — brand colored */}
        {!selectedSet && flashcardSets.length > 0 && (
          <button
            onClick={handleGenerateFlashcards}
            disabled={generating}
            className="fixed bottom-10 right-10 w-16 h-16 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition transform disabled:opacity-50"
            style={brandBtnStyle}
            {...brandHover}
          >
            <Plus size={26} />
          </button>
        )}
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Flashcard Set?"
      >
        <p className="mb-6 text-slate-600">
          This action cannot be undone. Are you sure you want to delete this set?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 bg-slate-200 rounded-xl hover:bg-slate-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            disabled={deleting}
            className="px-5 py-2 bg-red-600 text-white rounded-xl shadow hover:bg-red-700 transition disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default FlashcardManager;
