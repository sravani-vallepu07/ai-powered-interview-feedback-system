import { useState, useEffect, useRef } from "react";
import { Camera, CameraOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VoiceRecorder from "./VoiceRecorder";

export default function Interview({ title, questions, expectedAnswers }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [stopSignal, setStopSignal] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  // 🆕 Reset answers when starting a new interview
  // 🆕 Reset answers when starting a new interview
  useEffect(() => {
    // Only reset if this is a new interview (questions changed)
    if (questions.length > 0) {
      setAnswers(Array(questions.length).fill(""));
      setCurrentQ(0);
      localStorage.removeItem("answers");
    }
  }, [questions.length]); // Only reset when number of questions changes // Only run once when component mounts

  // Save answers in localStorage (only while in same session)
  useEffect(() => {
    localStorage.setItem("answers", JSON.stringify(answers));
  }, [answers]);

  // 🎥 Start camera
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch((err) => {
            console.error("Video play failed:", err);
          });
        };
      }

      setIsCameraOn(true);
      setIsMuted(false);
    } catch (err) {
      console.error("Camera error:", err.name, err.message);
    }
  };

  // 🎥 Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  // 🎤 Mute/unmute audio
  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  };

  // 👉 Next question
  const nextQuestion = () => {
    // 🛑 stop mic before moving on
    setStopSignal((s) => s + 1);

    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      navigate("/summary", {
        state: { questions, answers, expectedAnswers },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-6">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">
        {title}
      </h1>
  
      {/* Main Content - Side by Side Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side - Camera */}
        <div className="space-y-6">
          {/* Camera Preview */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4 text-center">Camera Preview</h3>
            <div className="flex justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md h-64 bg-black rounded-xl shadow"
              ></video>
            </div>
          </div>
  
          {/* Camera Controls */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4 text-center">Camera Controls</h3>
            <div className="flex justify-center gap-6">
              <button
                onClick={isCameraOn ? stopCamera : startCamera}
                className={`p-4 rounded-full shadow ${
                  isCameraOn ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                }`}
              >
                {isCameraOn ? <CameraOff /> : <Camera />}
              </button>
              {isCameraOn && (
                <button
                  onClick={toggleMute}
                  className={`p-4 rounded-full shadow ${
                    isMuted ? "bg-gray-500 text-white" : "bg-yellow-500 text-white"
                  }`}
                >
                  {isMuted ? "Unmute" : "Mute"}
                </button>
              )}
            </div>
          </div>
        </div>
  
        {/* Right Side - Question */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-lg mb-4">
            Question {currentQ + 1} of {questions.length}
          </h3>
          <p className="text-gray-700 mb-6 text-lg leading-relaxed">{questions[currentQ]}</p>
  
          {/* VoiceRecorder */}
          <div className="mb-6">
            <VoiceRecorder
              stopSignal={stopSignal}
              onTranscribed={(text) => {
                const updated = [...answers];
                updated[currentQ] = text;
                setAnswers(updated);
              }}
            />
          </div>
  
          {/* Answer box */}
          <textarea
            value={answers[currentQ] || ""}
            onChange={(e) => {
              const updated = [...answers];
              updated[currentQ] = e.target.value;
              setAnswers(updated);
            }}
            className="w-full border rounded p-3 focus:outline-blue-500 mb-6"
            rows="6"
            placeholder="Your answer will appear here..."
          ></textarea>
  
  <div className="flex justify-center">
  <button
    onClick={nextQuestion}
    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
  >
    {currentQ < questions.length - 1 ? "Next Question" : "Finish Interview"}
  </button>
</div>
        </div>
      </div>
    </div>
  );}