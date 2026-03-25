import React, { useEffect, useState } from "react";
import Spinner from "../../components/common/Spinner";
import progressService from "../../services/progressService";
import toast from "react-hot-toast";
import {
  FileText,
  BookOpen,
  BrainCircuit,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await progressService.getDashboardData();

        console.log("Dashboard API Response:", response.data); // ✅ DEBUG

        setDashboardData(response);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Spinner />;

  if (!dashboardData || !dashboardData.overview) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">No dashboard data available.</p>
      </div>
    );
  }

  /* ✅ Stats */
  const stats = [
    {
      label: "Total Documents",
      value: dashboardData.overview.totalDocuments || 0,
      icon: FileText,
      gradient: "from-blue-400 to-cyan-500",
    },
    {
      label: "Total Flashcards",
      value: dashboardData.overview.totalFlashcards || 0,
      icon: BookOpen,
      gradient: "from-purple-400 to-pink-500",
    },
    {
      label: "Total Quizzes",
      value: dashboardData.overview.totalQuizzes || 0,
      icon: BrainCircuit,
      gradient: "from-emerald-400 to-teal-500",
    },
    {
      label: "Learning Streak",
      value: dashboardData.overview.learningStreak || 0,
      icon: TrendingUp,
      gradient: "from-orange-400 to-rose-500",
    },
  ];

  /* ✅ SAFE DATE FORMATTER */
  const formatDate = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "—" : d.toLocaleString();
  };

  /* ✅ FIXED ACTIVITIES */
  const activities = [
    ...(dashboardData?.recentActivity?.documents || []).map((doc) => ({
      id: doc._id,
      type: "document",
      title: doc.title || "Untitled Document",
      timestamp: doc.lastAccessed || doc.updatedAt || doc.createdAt,
      link: `/documents/${doc._id}`,
    })),

    ...(dashboardData?.recentActivity?.quizzes || []).map((quiz) => ({
      id: quiz._id,
      type: "quiz",
      title: quiz.title || "Untitled Quiz",
      timestamp:
        quiz.lastAttempted || quiz.updatedAt || quiz.createdAt,
      link: `/quizzes/${quiz._id}`,
    })),
  ]
    .filter((item) => item.timestamp) // ✅ remove invalid ones
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500">
          Track your learning progress and activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-slate-200 rounded-xl p-5 flex justify-between items-center"
          >
            <div>
              <p className="text-xs uppercase text-slate-500 font-semibold">
                {stat.label}
              </p>
              <p className="text-3xl font-semibold text-slate-900 mt-2">
                {stat.value}
              </p>
            </div>

            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}
            >
              <stat.icon className="w-5 h-5 text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            Recent Activity
          </h3>
        </div>

        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex justify-between items-center p-4 rounded-lg bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "document"
                        ? "bg-blue-500"
                        : "bg-emerald-500"
                    }`}
                  />
                  <p className="text-sm text-slate-900 truncate">
                    {activity.type === "document"
                      ? "Accessed Document: "
                      : "Attempted Quiz: "}
                    <span className="font-normal">{activity.title}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500">
                    {formatDate(activity.timestamp)}
                  </span>

                  <Link
                    to={activity.link}
                    className="text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Clock className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              No recent activity yet.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Start learning to see your progress here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;