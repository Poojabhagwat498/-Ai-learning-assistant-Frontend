import React from "react";
import { useAuth } from "../../context/AuthContext";
import { User, Menu } from "lucide-react";
import NotificationBell from "../NotificationBell";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 h-16 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="flex items-center justify-between h-full px-6">
        
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="md:hidden inline-flex items-center justify-center w-10 h-10
          text-slate-600 hover:text-slate-900 hover:bg-slate-100
          rounded-xl transition-all duration-200"
        >
          <Menu size={24} />
        </button>

        {/* Spacer */}
        <div className="hidden md:block" />

        {/* Right side */}
        <div className="flex items-center gap-4">

          {/* 🔔 REAL-TIME NOTIFICATION BELL */}
          <NotificationBell />

          {/* USER */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200/60">
            <div
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl
              hover:bg-slate-50 transition-colors duration-200 cursor-pointer group"
            >
              <div
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500
                flex items-center justify-center text-white shadow-md
                shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-all duration-200"
              >
                <User size={18} strokeWidth={2.5} />
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {user?.username || "User"}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;