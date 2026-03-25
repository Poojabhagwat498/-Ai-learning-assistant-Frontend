import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import socket from "../utils/socket";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000/api";

const NotificationBell = () => {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ✅ Fetch notification count
  const fetchCount = async () => {
    try {
      const res = await axios.get(`${API}/groups/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // safer handling
      setCount(Array.isArray(res.data) ? res.data.length : 0);
    } catch (err) {
      console.error("Notification fetch error:", err.response?.data || err.message);
      setCount(0); // fallback
    }
  };

  // 📥 Initial load
  useEffect(() => {
    if (token) {
      fetchCount();
    }
  }, [token]);

  // 🔥 Real-time updates
  useEffect(() => {
    socket.on("newRequest", () => {
      setCount((prev) => prev + 1);
    });

    return () => {
      socket.off("newRequest");
    };
  }, []);

  return (
    <div
      onClick={() => navigate("/requests")}
      className="relative inline-flex items-center justify-center w-10 h-10
      text-slate-600 hover:text-slate-900 hover:bg-slate-100
      rounded-xl transition-all duration-200 cursor-pointer group"
    >
      <Bell
        size={20}
        className="transition-transform duration-200 group-hover:scale-110"
      />

      {/* 🔴 Notification Count */}
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;