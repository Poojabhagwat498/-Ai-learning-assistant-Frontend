import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";

import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import Dashboard from "./pages/Dashboard/Dashboard";
import DocumentListPage from "./pages/documents/DocumentListPage";
import DocumentDetailPage from "./pages/documents/DocumentDetailPage";

import FlashCardList from "./pages/flashcards/FlashCardList";
import FlashCard from "./pages/flashcards/FlashCard";

import QuizTake from "./pages/quizzes/QuizTake";
import QuizResult from "./pages/quizzes/QuizResult";

import ProfilePage from "./pages/Profile/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

import TodoPage from "./pages/TodoPage";
import GroupStudy from "./pages/GroupStudy";
import Meeting from "./pages/Meeting";
import Requests from "./pages/Requests";

import { useAuth } from "./context/AuthContext";
import socket from "./utils/socket";

/* =========================
   🔥 SOCKET LISTENER WRAPPER
========================= */
const SocketHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ When request accepted → go to video
    socket.on("requestAccepted", ({ groupId }) => {
      console.log("🔥 Redirecting to video:", groupId);
      navigate(`/video/${groupId}`);
    });

    return () => {
      socket.off("requestAccepted");
    };
  }, [navigate]);

  return null;
};

const App = () => {
  const { isAuthenticated, loading, user } = useAuth();

  // 🔥 JOIN USER ROOM
  useEffect(() => {
    if (user?._id) {
      socket.emit("joinUserRoom", user._id);
    }
  }, [user]);

  // ⏳ Loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }


  
  return (
    <Router>

      {/* 🔥 GLOBAL SOCKET HANDLER */}
      <SocketHandler />

      <Routes>

        {/* ================= PUBLIC ================= */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <LoginPage />
          }
        />

        <Route
          path="/register"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <RegisterPage />
          }
        />

        {/* ================= PROTECTED ================= */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>

            <Route path="/dashboard" element={<Dashboard />} />

            {/* Documents */}
            <Route path="/documents" element={<DocumentListPage />} />
            <Route path="/documents/:id" element={<DocumentDetailPage />} />

            {/* Flashcards */}
            <Route path="/flashcards" element={<FlashCardList />} />
            <Route path="/documents/:id/flashcards" element={<FlashCard />} />

            {/* Quizzes */}
            <Route path="/quizzes/:quizId" element={<QuizTake />} />
            <Route path="/quizzes/:quizId/results" element={<QuizResult />} />

            {/* Todo */}
            <Route path="/todos" element={<TodoPage />} />

            {/* Group Study */}
            <Route path="/group-study" element={<GroupStudy />} />

            {/* Requests */}
            <Route path="/requests" element={<Requests />} />

            {/* 🎥 Video */}
            <Route path="/video/:groupId" element={<Meeting />} />

            {/* Profile */}
            <Route path="/profile" element={<ProfilePage />} />

          </Route>
        </Route>

        {/* ================= 404 ================= */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </Router>
  );
};

export default App;