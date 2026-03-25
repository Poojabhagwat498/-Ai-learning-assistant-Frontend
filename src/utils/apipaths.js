export const BASE_URL = import.meta.env.VITE_URL;

export const API_PATHS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    GET_PROFILE: "/auth/profile",
    UPDATE_PROFILE: "/auth/profile",
    CHANGE_PASSWORD: "/auth/change-password",
  },

  DOCUMENTS: {
    UPLOAD: "/documents/upload",
    GET_DOCUMENTS: "/documents",
    GET_DOCUMENT_BY_ID: (id) => `/documents/${id}`,
    UPDATE_DOCUMENT: (id) => `/documents/${id}`,
    DELETE_DOCUMENT: (id) => `/documents/${id}`,
  },

  AI: {
    GENERATE_FLASHCARDS: "/ai/generate-flashcards",
    GENERATE_QUIZ: "/ai/generate-quiz",
    GENERATE_SUMMARY: "/ai/generate-summary",
    CHAT: "/ai/chat",
    EXPLAIN_CONCEPT: "/ai/explain-concept",
    GET_CHAT_HISTORY: (documentId) =>
      `/ai/chat-history/${documentId}`,
  },

  FLASHCARDS: {
    GET_ALL_FLASHCARD_SETS: "/flashcards",
    GET_FLASHCARDS_FOR_DOC: (documentId) =>
      `/flashcards/${documentId}`,
    REVIEW_FLASHCARD: (cardId) =>
      `/flashcards/${cardId}/review`,
    TOGGLE_STAR: (cardId) =>
      `/flashcards/${cardId}/star`,
    DELETE_FLASHCARD_SET: (id) =>
      `/flashcards/${id}`,
  },

  QUIZZES: {
    GET_QUIZZES_FOR_DOC: (documentId) =>
      `/quizzes/${documentId}`,
    GET_QUIZ_BY_ID: (id) =>
      `/quizzes/quiz/${id}`,
    SUBMIT_QUIZ: (id) =>
      `/quizzes/${id}/submit`,
    GET_QUIZ_RESULTS: (id) =>
      `/quizzes/${id}/results`,
    DELETE_QUIZ: (id) =>
      `/quizzes/${id}`,
  },

  PROGRESS: {
    GET_DASHBOARD: "/progress/dashboard",
  },
};
