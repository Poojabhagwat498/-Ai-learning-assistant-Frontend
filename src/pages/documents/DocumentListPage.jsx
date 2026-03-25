import React, { useState, useEffect } from "react";
import { Plus, Upload, Trash2, FileText, X } from "lucide-react";
import toast from "react-hot-toast";

import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import DocumentCard from "../../components/documents/DocumentCard";

const DocumentListPage = () => {

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadTitle, setUploadTitle] = useState("");
    const [uploading, setUploading] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);

    const fetchDocuments = async () => {
        try {
            const data = await documentService.getDocuments();
            setDocuments(data);
        } catch (error) {
            toast.error("Failed to fetch documents.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadFile(file);
            setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile || !uploadTitle) {
            toast.error("Please provide a title and select a file.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", uploadFile);
        formData.append("title", uploadTitle);

        try {
            await documentService.uploadDocument(formData);
            toast.success("Document uploaded successfully!");
            setIsUploadModalOpen(false);
            setUploadFile(null);
            setUploadTitle("");
            setLoading(true);
            fetchDocuments();
        } catch (error) {
            toast.error(error.message || "Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteRequest = (docId) => {
        const doc = documents.find(d => d._id === docId);
        setSelectedDoc(doc);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedDoc) return;
        setDeleting(true);
        try {
            await documentService.deleteDocument(selectedDoc._id);
            toast.success(`'${selectedDoc.title}' deleted.`);
            setIsDeleteModalOpen(false);
            setSelectedDoc(null);
            setDocuments(documents.filter((d) => d._id !== selectedDoc._id));
        } catch (error) {
            toast.error(error.message || "Failed to delete document.");
        } finally {
            setDeleting(false);
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center py-24">
                    <Spinner />
                </div>
            );
        }

        if (documents.length === 0) {
            return (
                <div className="text-center py-24">
                    <FileText className="mx-auto mb-4 w-12 h-12 text-slate-400" />
                    <h3 className="text-xl font-medium text-slate-800 mb-2">
                        No documents yet
                    </h3>
                    <p className="text-slate-500 mb-6">
                        Upload a PDF to start learning
                    </p>
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white hover:bg-slate-800 transition"
                    >
                        <Plus className="w-4 h-4" />
                        Upload Document
                    </button>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc) => (
                    <DocumentCard
                        key={doc._id}
                        document={doc}
                        onDelete={handleDeleteRequest}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 relative">
            <div className="relative max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900">
                            My Documents
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Your personal learning library
                        </p>
                    </div>

                    <Button onClick={() => setIsUploadModalOpen(true)}>
                        <Plus className="w-4 h-4" />
                        Upload
                    </Button>
                </div>

                {renderContent()}
            </div>

         {/* Modal Header */}
     {isUploadModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xl">
    <div className="relative w-full max-w-lg bg-white/95 border border-slate-200/50 rounded-2xl shadow-2xl">

      {/* Close button */}
      <button
        onClick={() => setIsUploadModalOpen(false)}
        className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100"
      >
        <X className="w-5 h-5" strokeWidth={2} />
      </button>

      {/* Header */}
      <div className="mb-6 p-6">
        <h2 className="text-xl font-medium text-slate-900">
          Upload New Document
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Add a PDF document to your library
        </p>
      </div>

      {/* FORM START */}
      <form onSubmit={handleUpload} className="space-y-5 px-6 pb-6">

        {/* Title Input */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
            Document Title
          </label>
          <input
            type="text"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            required
            className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            placeholder="e.g., React Interview Prep"
          />
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
            PDF File
          </label>

          <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:border-emerald-300 transition-colors">
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleFileChange}
              accept=".pdf"
              required
            />

            <div className="flex flex-col items-center justify-center py-10 px-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center mb-4">
                <Upload className="w-7 h-7 text-emerald-600" />
              </div>

              {uploadFile ? (
                <p className="text-sm font-medium text-emerald-600">
                  {uploadFile.name}
                </p>
              ) : (
                <>
                  <span className="text-emerald-600 font-medium">
                    Click to upload
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    PDF up to 10MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS INSIDE FORM */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(false)}
            disabled={uploading}
            className="flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-white text-slate-900 font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={uploading}
            className="flex-1 h-11 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </span>
            ) : (
              "Upload"
            )}
          </button>
        </div>

      </form>
      {/* FORM END */}

    </div>
  </div>
)}

       
       
     {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xl">
          <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-lg">
            {/* Close button */}
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>

            {/* Modal Content */}
            <div className="p-6">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-100 to-red-200 flex items-center justify-center mb-6">
                <Trash2 className="w-6 h-6 text-red-600" strokeWidth={2} />
              </div>

              {/* Title */}
              <h2 className="text-xl font-medium text-slate-900 tracking-tight mb-4">
                Confirm Deletion
              </h2>

              {/* Content */}
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete the document{" "}
                <span className="font-semibold text-slate-900">
                  {selectedDoc?.title}
                </span>
                ? This action cannot be undone.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={deleting}
                  className="flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-white text-slate-900 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 h-11 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  {deleting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </span>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentListPage;
