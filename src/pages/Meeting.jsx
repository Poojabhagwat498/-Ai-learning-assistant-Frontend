import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../utils/socket";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const Meeting = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStreamRef = useRef(null);

  // ✅ FIX: Queue ICE candidates that arrive before remoteDescription is set
  const pendingCandidates = useRef([]);

  const [hasStream, setHasStream] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // =========================
  // 🎥 INIT MEDIA
  // =========================
const initMedia = async () => {
  try {
    // STEP 1: Check permission state
    const permission = await navigator.permissions.query({ name: "camera" });

    if (permission.state === "denied") {
      alert("❌ Camera permission is blocked. Please allow it in browser settings.");
      return null;
    }

    let stream;

    try {
      // STEP 2: Try full media
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
    } catch (err) {
      console.warn("Full media failed:", err);

      try {
        // STEP 3: Try audio only
        stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
      } catch (err2) {
        console.error("Audio also failed:", err2);
        alert("❌ No camera/microphone found OR permission denied.");
        return null;
      }
    }

    // STEP 4: Attach stream
    localStreamRef.current = stream;
    setHasStream(true);

    setTimeout(() => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.play().catch(() => {});
      }
    }, 100);

    return stream;

  } catch (error) {
    console.error("Media error:", error);

    if (error.name === "NotAllowedError") {
      alert("❌ Permission denied. Please allow camera & mic.");
    } else if (error.name === "NotFoundError") {
      alert("❌ No camera/mic device found.");
    } else {
      alert("❌ Unexpected media error.");
    }

    return null;
  }
};

  // =========================
  // 🔗 CREATE PEER CONNECTION
  // =========================
  const createPeerConnection = useCallback(
    (stream) => {
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }

      // ✅ FIX: Reset pending ICE queue on each fresh connection
      pendingCandidates.current = [];

      const pc = new RTCPeerConnection(ICE_SERVERS);

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        setIsConnected(true);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            roomId: groupId,
            candidate: event.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "disconnected" ||
          pc.connectionState === "failed"
        ) {
          setIsConnected(false);
        }
      };

      peerConnection.current = pc;
      return pc;
    },
    [groupId]
  );

  // =========================
  // 📡 CREATE OFFER
  // =========================
  const createOffer = useCallback(async () => {
    const stream = localStreamRef.current;
    if (!stream) {
      console.warn("createOffer: stream not ready");
      return;
    }

    const pc = createPeerConnection(stream);
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", { roomId: groupId, offer });
    } catch (err) {
      console.error("createOffer error:", err);
    }
  }, [groupId, createPeerConnection]);

  // =========================
  // ✅ DRAIN QUEUED ICE CANDIDATES
  // =========================
  const drainPendingCandidates = async (pc) => {
    for (const candidate of pendingCandidates.current) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Drain ICE error:", err);
      }
    }
    pendingCandidates.current = [];
  };

  // =========================
  // 🚀 START CALL (button click)
  // =========================
  const startCall = async () => {
    const stream = await initMedia();
    if (!stream) return;

    socket.emit("joinRoom", groupId);
    if (user?._id) socket.emit("joinUserRoom", user._id);
  };

  // =========================
  // 🔌 SOCKET EVENTS
  // =========================
  useEffect(() => {
    // ✅ FIX: Removed socket.connect() here — socket utility should manage
    // its own connection. Calling connect() here causes duplicate connections.

    const handleUserJoined = () => {
      setTimeout(createOffer, 500);
    };

    const handleOffer = async ({ offer }) => {
      const stream = localStreamRef.current;
      if (!stream) {
        console.warn("Received offer but stream not ready");
        return;
      }

      const pc = createPeerConnection(stream);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // ✅ FIX: Drain any ICE candidates queued before this offer was processed
        await drainPendingCandidates(pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { roomId: groupId, answer });
      } catch (err) {
        console.error("handleOffer error:", err);
      }
    };

    const handleAnswer = async ({ answer }) => {
      const pc = peerConnection.current;
      if (!pc) return;

      // ✅ FIX: Guard — only set answer when in the correct signaling state
      if (pc.signalingState !== "have-local-offer") {
        console.warn("handleAnswer: wrong signalingState:", pc.signalingState);
        return;
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        // Drain queued candidates now that remote description is set
        await drainPendingCandidates(pc);
      } catch (err) {
        console.error("handleAnswer error:", err);
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      if (!candidate) return;
      const pc = peerConnection.current;

      // ✅ FIX: Queue candidate instead of dropping it if remote desc not set yet
      if (!pc || !pc.remoteDescription) {
        pendingCandidates.current.push(candidate);
        return;
      }

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("ICE candidate error:", err);
      }
    };

    const handleChatMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("userJoined", handleUserJoined);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("chatMessage", handleChatMessage);

    return () => {
      socket.off("userJoined", handleUserJoined);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("chatMessage", handleChatMessage);

      peerConnection.current?.close();
      peerConnection.current = null;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    };
  }, [groupId, createOffer, createPeerConnection]);

  // =========================
  // 🎛 CONTROLS
  // =========================
  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsMuted(!track.enabled);
  };

  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsCameraOff(!track.enabled);
  };

  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];

      const sender = peerConnection.current
        ?.getSenders()
        .find((s) => s.track?.kind === "video");

      if (sender) {
        await sender.replaceTrack(screenTrack);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
      }

      screenTrack.onended = async () => {
        const videoTrack = localStreamRef.current?.getVideoTracks()[0];
        if (sender && videoTrack) await sender.replaceTrack(videoTrack);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
      };
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const data = {
      roomId: groupId,
      user: user?.name || "Anonymous",
      text: chatInput.trim(),
    };
    socket.emit("chatMessage", data);
    setChatInput("");
  };

  const leaveMeeting = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    peerConnection.current?.close();
    socket.emit("leaveRoom", groupId);
    navigate("/group-study");
  };

  // =========================
  // 🖼 UI
  // =========================
  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col">

      {/* HEADER */}
      <div className="flex justify-between items-center px-5 py-3 bg-gray-800 shadow">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-base">Meeting Room</h2>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isConnected ? "bg-green-600" : "bg-yellow-600"
            }`}
          >
            {isConnected ? "● Connected" : "○ Waiting..."}
          </span>
        </div>
        <button
          onClick={leaveMeeting}
          className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded text-sm font-medium transition"
        >
          Leave
        </button>
      </div>

      {/* PRE-JOIN SCREEN */}
      {!hasStream ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-gray-400 text-sm">Allow camera & mic, then join</p>
          <button
            onClick={startCall}
            className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg text-base font-semibold transition"
          >
            📷 Start Camera & Join
          </button>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">

          {/* VIDEO + CONTROLS */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 relative bg-black">
              {/* Remote (main) video */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                  Waiting for participant to join...
                </div>
              )}
              {/* Local PiP */}
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="absolute bottom-4 right-4 w-44 rounded-xl border-2 border-gray-600 shadow-xl bg-black"
              />
            </div>

            {/* CONTROLS BAR */}
            <div className="flex justify-center gap-3 py-3 bg-gray-800 border-t border-gray-700">
              <button
                onClick={toggleMute}
                className={`px-4 py-2 rounded text-sm font-medium transition ${
                  isMuted
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-600 hover:bg-gray-500"
                }`}
              >
                {isMuted ? "🔇 Unmute" : "🎙 Mute"}
              </button>
              <button
                onClick={toggleCamera}
                className={`px-4 py-2 rounded text-sm font-medium transition ${
                  isCameraOff
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-600 hover:bg-gray-500"
                }`}
              >
                {isCameraOff ? "📷 Cam On" : "📷 Cam Off"}
              </button>
              <button
                onClick={shareScreen}
                className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-sm font-medium transition"
              >
                🖥 Share Screen
              </button>
            </div>
          </div>

          {/* CHAT PANEL */}
          <div className="w-72 flex flex-col bg-gray-800 border-l border-gray-700">
            <div className="px-4 py-2 border-b border-gray-700 text-sm font-semibold text-gray-300">
              Chat
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
              {messages.length === 0 && (
                <p className="text-gray-500 text-xs text-center mt-6">
                  No messages yet
                </p>
              )}
              {messages.map((m, i) => (
                <div key={i} className="text-sm">
                  <span className="font-semibold text-blue-400">{m.user}: </span>
                  <span className="text-gray-200">{m.text}</span>
                </div>
              ))}
            </div>
            <div className="flex border-t border-gray-700">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 text-white text-sm px-3 py-2 outline-none placeholder-gray-500"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 hover:bg-blue-700 px-3 text-sm font-medium transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meeting;
