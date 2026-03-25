import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Trash2,
  BookOpen,
  BrainCircuit,
  Clock,
} from "lucide-react";
import moment from "moment";

const formatFileSize = (bytes) => {
  if (!bytes) return "N/A";

  const sizes = ["B", "KB", "MB", "GB"];
  let i = 0;
  let size = bytes;

  while (size >= 1024 && i < sizes.length - 1) {
    size /= 1024;
    i++;
  }

  return `${size.toFixed(1)} ${sizes[i]}`;
};

const DocumentCard = ({ document, onDelete }) => {
  const navigate = useNavigate();

  if (!document) return null;

  const handleNavigate = () => {
    navigate(`/documents/${document._id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(document._id);
  };

  return (
    <div
      onClick={handleNavigate}
      className="group bg-white rounded-2xl border border-slate-200 p-6 cursor-pointer hover:shadow-lg transition-all duration-300 relative"
    >
      {/* Top Section */}
      <div className="flex justify-between items-start mb-4">
        {/* Green File Icon */}
        <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm">
          <FileText className="w-6 h-6 text-white" strokeWidth={2} />
        </div>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Title */}
      <h3
        className="font-semibold text-slate-900 text-base truncate mb-1"
        title={document.title}
      >
        {document.title}
      </h3>

      {/* File Size */}
      <p className="text-sm text-slate-500 mb-4">
        {formatFileSize(document.fileSize)}
      </p>

      {/* Stats Section */}
      <div className="flex items-center gap-3 mb-4">
        {/* Flashcards Badge */}
        <div className="flex items-center gap-1 bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full">
          <BookOpen className="w-3.5 h-3.5" />
          {document.flashcardCount || 0} Flashcards
        </div>

        {/* Quizzes Badge */}
        <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full">
          <BrainCircuit className="w-3.5 h-3.5" />
          {document.quizCount || 0} Quizzes
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Clock className="w-4 h-4" />
        <span>
          Uploaded {moment(document.createdAt).fromNow()}
        </span>
      </div>
    </div>
  );
};

export default DocumentCard;
