import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Video,
  Trash,
  Users,
  UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";

const API = "http://localhost:8000/api";

const GroupStudy = () => {
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState({});
  const [openAddMember, setOpenAddMember] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ================= FETCH =================
  useEffect(() => {
    if (!token) {
      toast.error("Please login again");
      navigate("/login");
      return;
    }

    fetchGroups();
    fetchUsers();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setGroups(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users");
    }
  };

  // ================= CREATE GROUP =================
  const createGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Enter group name");
      return;
    }

    try {
      await axios.post(
        `${API}/groups`,
        { name: groupName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Group created");
      setGroupName("");
      fetchGroups();
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Create failed");
    }
  };

  // ================= SEND REQUEST =================
  const addMembers = async (groupId) => {
    const selected = selectedUsers[groupId] || [];

    if (selected.length === 0) {
      toast.error("Select users first");
      return;
    }

    try {
      await Promise.all(
        selected.map(async (userId) => {
          return axios.post(
            `${API}/groups/${groupId}/request`,
            { userId },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        })
      );

      toast.success("Request sent successfully");

      setSelectedUsers((prev) => ({
        ...prev,
        [groupId]: [],
      }));

      setOpenAddMember((prev) => ({
        ...prev,
        [groupId]: false,
      }));
    } catch (error) {
      console.error("REQUEST ERROR:", error.response?.data);
      toast.error(
        error.response?.data?.message ||
          "Failed to send request (User may already be invited)"
      );
    }
  };

  // ================= REMOVE MEMBER =================
  const removeMember = async (groupId, userId) => {
    try {
      await axios.delete(
        `${API}/groups/${groupId}/members/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Member removed");
      fetchGroups();
    } catch (error) {
      console.error(error.response?.data);
      toast.error("Remove failed");
    }
  };

  // ================= DELETE GROUP =================
  const deleteGroup = async (groupId) => {
    if (!window.confirm("Delete this group?")) return;

    try {
      await axios.delete(`${API}/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Group deleted");
      fetchGroups();
    } catch (error) {
      console.error(error.response?.data);
      toast.error("Delete failed");
    }
  };

  // ================= JOIN VIDEO =================
  const joinGroup = (groupId) => {
    navigate(`/video/${groupId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Group Study
          </h1>
          <p className="text-slate-500">
            Create and collaborate with your study groups
          </p>
        </div>

        {/* CREATE GROUP */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Plus size={18} /> Create New Group
          </h2>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="flex-1 h-11 px-4 border-2 rounded-xl"
            />

            <button
              onClick={createGroup}
              className="h-11 px-5 bg-emerald-500 text-white rounded-xl"
            >
              Create
            </button>
          </div>
        </div>

        {/* GROUPS */}
        <div className="grid gap-6">
          {groups.map((group) => (
            <div
              key={group._id}
              className="bg-white p-6 rounded-2xl shadow-sm border space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="font-semibold flex items-center gap-2">
                  <Users size={18} /> {group.name}
                </h2>

                <div className="flex gap-2">
                  <button
                    onClick={() => joinGroup(group._id)}
                    className="p-2 bg-blue-500 text-white rounded"
                  >
                    <Video size={16} />
                  </button>

                  <button
                    onClick={() => deleteGroup(group._id)}
                    className="p-2 bg-red-500 text-white rounded"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>

              {/* MEMBERS */}
              <div>
                <h3 className="font-medium mb-2">Members</h3>

                {group.members?.length > 0 ? (
                  group.members.map((member) => (
                    <div
                      key={member._id}
                      className="flex justify-between bg-slate-50 px-3 py-2 rounded"
                    >
                      <span>
                        {member.name} ({member.email})
                      </span>

                      <button
                        onClick={() =>
                          removeMember(group._id, member._id)
                        }
                        className="text-red-500 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    No members yet
                  </p>
                )}
              </div>

              {/* ADD MEMBERS */}
              <button
                onClick={() =>
                  setOpenAddMember((prev) => ({
                    ...prev,
                    [group._id]: !prev[group._id],
                  }))
                }
                className="flex items-center gap-2 text-emerald-600"
              >
                <UserPlus size={16} /> Add Members
              </button>

              {openAddMember[group._id] && (
                <div className="flex gap-3">
                  <select
                    multiple
                    size={4}
                    value={selectedUsers[group._id] || []}
                    onChange={(e) =>
                      setSelectedUsers((prev) => ({
                        ...prev,
                        [group._id]: Array.from(
                          e.target.selectedOptions,
                          (o) => o.value
                        ),
                      }))
                    }
                    className="flex-1 border rounded p-2"
                  >
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => addMembers(group._id)}
                    className="bg-emerald-500 text-white px-4 rounded"
                  >
                    Send Request
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupStudy;