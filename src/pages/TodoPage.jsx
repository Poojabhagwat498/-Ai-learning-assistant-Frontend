import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Check,
  Pencil,
  X,
  ClipboardList,
  Trash2,
} from "lucide-react";

const TodoPage = () => {
  const navigate = useNavigate();

  const [newTodo, setNewTodo] = useState("");
  const [todos, setTodos] = useState([]); // ✅ always array
  const [editingTodo, setEditingTodo] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [filter, setFilter] = useState("all");

  const API_URL = import.meta.env.VITE_URL;
  const token = localStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ================= FETCH TODOS ================= */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchTodos = async () => {
      try {
        const res = await axios.get(`${API_URL}/todos`, authConfig);

        // ✅ Safe handling of response
        if (Array.isArray(res.data)) {
          setTodos(res.data);
        } else if (Array.isArray(res.data.todos)) {
          setTodos(res.data.todos);
        } else {
          setTodos([]);
        }
      } catch (error) {
        console.error("Failed to fetch todos:", error);
        setTodos([]); // never crash
      }
    };

    fetchTodos();
  }, []);

  /* ================= ADD TODO ================= */
  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const res = await axios.post(
        `${API_URL}/todos`,
        { text: newTodo },
        authConfig
      );

      const newItem =
        res.data?.todo || res.data;

      setTodos((prev) => [...prev, newItem]);
      setNewTodo("");
    } catch (error) {
      console.error("Failed to add todo:", error);
    }
  };

  /* ================= EDIT ================= */
  const startEditing = (todo) => {
    setEditingTodo(todo._id);
    setEditedText(todo.text);
  };

  const saveEdit = async (id) => {
    if (!editedText.trim()) return;

    try {
      const res = await axios.patch(
        `${API_URL}/todos/${id}`,
        { text: editedText },
        authConfig
      );

      const updated =
        res.data?.todo || res.data;

      setTodos((prev) =>
        prev.map((t) => (t._id === id ? updated : t))
      );

      setEditingTodo(null);
    } catch (error) {
      console.error("Failed to save edit:", error);
    }
  };

  /* ================= DELETE ================= */
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`, authConfig);
      setTodos((prev) => prev.filter((t) => t._id !== id));
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  /* ================= TOGGLE ================= */
  const toggleTodo = async (id) => {
    const todo = todos.find((t) => t._id === id);
    if (!todo) return;

    try {
      const res = await axios.patch(
        `${API_URL}/todos/${id}`,
        { completed: !todo.completed },
        authConfig
      );

      const updated =
        res.data?.todo || res.data;

      setTodos((prev) =>
        prev.map((t) => (t._id === id ? updated : t))
      );
    } catch (error) {
      console.error("Failed to toggle todo:", error);
    }
  };

  /* ================= FILTER ================= */
  const filteredTodos = Array.isArray(todos)
    ? todos.filter((todo) => {
        if (filter === "completed") return todo.completed;
        if (filter === "pending") return !todo.completed;
        return true;
      })
    : [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Task Manager</h1>

      {/* Filter Buttons */}
      <div className="flex gap-3 mb-6">
        {["all", "completed", "pending"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition
              ${
                filter === type
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 hover:bg-slate-200"
              }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Add Todo */}
      <form onSubmit={addTodo} className="flex gap-2 mb-6">
        <input
          className="flex-1 border border-slate-300 p-2 rounded-lg"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button
          type="submit"
          className="bg-emerald-500 text-white px-6 rounded-lg"
        >
          Add
        </button>
      </form>

      {/* List */}
      {filteredTodos.length === 0 ? (
        <p className="text-slate-500 flex items-center gap-2">
          <ClipboardList size={18} />
          No tasks found
        </p>
      ) : (
        <div className="space-y-4">
          {filteredTodos.map((todo) => (
            <div
              key={todo._id}
              className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-4"
            >
              {editingTodo === todo._id ? (
                <div className="flex gap-2 flex-1">
                  <input
                    className="flex-1 border p-2 rounded"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                  />
                  <button
                    onClick={() => saveEdit(todo._id)}
                    className="p-2 bg-green-500 text-white rounded"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => setEditingTodo(null)}
                    className="p-2 bg-gray-300 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => toggleTodo(todo._id)}
                      className={`h-6 w-6 rounded-full border flex items-center justify-center ${
                        todo.completed
                          ? "bg-green-500 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {todo.completed && <Check size={14} />}
                    </button>

                    <div>
                      <span
                        className={
                          todo.completed
                            ? "line-through text-slate-400"
                            : "text-slate-800"
                        }
                      >
                        {todo.text}
                      </span>

                      <p className="text-xs text-slate-400 mt-1">
                        {todo.updatedAt &&
                        todo.updatedAt !== todo.createdAt
                          ? `Updated: ${formatDateTime(todo.updatedAt)}`
                          : `Created: ${formatDateTime(todo.createdAt)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => startEditing(todo)}
                      className="text-blue-500"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo._id)}
                      className="text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoPage;
