import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import socket from "../utils/socket";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_URL;

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate(); // ✅ FIX: moved inside component

  // ✅ FETCH REQUESTS
  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API}/groups/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch (err) {
      toast.error("Failed to load requests");
    }
  };

  useEffect(() => {
    fetchRequests();

    const handleNewRequest = () => {
      fetchRequests();
    };

    // ✅ AUTO REDIRECT WHEN ACCEPTED
    const handleAccepted = ({ groupId }) => {
      toast.success("Request accepted! Joining meeting...");

      setTimeout(() => {
        navigate(`/video/${groupId}`);
      }, 1000);
    };

    socket.on("newRequest", handleNewRequest);
    socket.on("requestAccepted", handleAccepted);

    return () => {
      socket.off("newRequest", handleNewRequest);
      socket.off("requestAccepted", handleAccepted);
    };
  }, [navigate]); // ✅ include navigate in deps

  // ✅ ACCEPT REQUEST
  const accept = async (id) => {
    try {
      await axios.put(
        `${API}/groups/requests/${id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Joined group");
      fetchRequests();
    } catch (err) {
      toast.error("Failed to accept request");
    }
  };

  // ✅ REJECT REQUEST
  const reject = async (id) => {
    try {
      await axios.put(
        `${API}/groups/requests/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Rejected");
      fetchRequests();
    } catch (err) {
      toast.error("Failed to reject request");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Join Requests</h1>

      {requests.length === 0 && <p>No requests</p>}

      {requests.map((req) => (
        <div key={req._id} className="border p-4 rounded mb-3">
          <p className="font-medium">{req.groupId.name}</p>
          <p className="text-sm text-gray-500">
            Invited by: {req.sender.name}
          </p>

          <div className="mt-2 flex gap-2">
            <button
              onClick={() => accept(req._id)}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Accept
            </button>

            <button
              onClick={() => reject(req._id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Requests;