import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { evaluateAll } from "../gemini";

export default function Summary() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    questions = [],
    answers = [],
    expectedAnswers = [],
  } = location.state || {};
  const [progress, setProgress] = useState(0);
  const [evaluations, setEvaluations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasEvaluated = useRef(false);

  useEffect(() => {
    const fetchEvaluations = async () => {
      // Prevent multiple calls
      if (hasEvaluated.current || questions.length === 0) {
        setIsLoading(false);
        return;
      }
    
      try {
        setIsLoading(true);
        setError(null);
        hasEvaluated.current = true; // Mark as evaluated
        
        console.log("Starting evaluation...");
        
        // Start AI evaluation
        const aiPromise = evaluateAll(questions, answers, expectedAnswers);
        
        // Add minimum delay of 8 seconds
        const delayPromise = new Promise(resolve => setTimeout(resolve, 8000));
        
        // Wait for both AI and delay to complete
        const results = await aiPromise;
        await delayPromise; // Ensure minimum 8 seconds
        
        console.log("Evaluation completed");
        setEvaluations(results);
      } catch (err) {
        console.error("Error fetching evaluations:", err);
        setError("Failed to load evaluations. Please try again.");
        hasEvaluated.current = false; // Reset on error so user can retry
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvaluations();
  }, [questions, answers, expectedAnswers]);

  const goBack = () => navigate("/career-options");

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '20px'
      }}>
        {/* Large Loading Spinner */}
        <div style={{
          width: '100px',
          height: '100px',
          border: '8px solid #e9ecef',
          borderTop: '8px solid #007bff',
          borderRadius: '50%',
          marginBottom: '30px',
          animation: 'spin 1s linear infinite'
        }}></div>
        
        <h1 style={{
          fontSize: '36px',
          color: '#2c3e50',
          marginBottom: '20px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>AI is Analyzing Your Answers</h1>
        
        <p style={{
          fontSize: '20px',
          color: '#6c757d',
          marginBottom: '30px',
          textAlign: 'center'
        }}>Please wait 8 seconds while AI generates your feedback...</p>
        
        {/* Progress Bar */}
        <div style={{
          width: '400px',
          height: '8px',
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          marginBottom: '20px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#007bff',
            borderRadius: '4px',
            animation: 'progress 8s linear infinite'
          }}></div>
        </div>
        
        {/* Countdown Timer */}
        <div style={{
          fontSize: '18px',
          color: '#007bff',
          fontWeight: 'bold'
        }}>
          Generating AI Response...
        </div>
        
        {/* CSS Animations */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes progress {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `
        }} />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-6">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-10">
        📊 Interview Summary
      </h1>

      <div className="max-w-4xl mx-auto space-y-6">
        {evaluations.map((evalResult, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-md border border-gray-200"
          >
            <h2 className="font-semibold text-lg text-gray-800">
              Q{i + 1}: {evalResult.question}
            </h2>

            <p className="mt-3 text-gray-700">
              <span className="font-semibold">🧑 Your Answer:</span>{" "}
              {answers[i] || "❌ No Answer"}
            </p>

            <p className="mt-2 text-gray-700">
              <span className="font-semibold">✅ Expected Answer:</span>{" "}
              {evalResult.expected_answer || "—"}
            </p>

            <p className="mt-3 text-gray-700">
              <span className="font-semibold">💡 Feedback:</span>{" "}
              {evalResult.feedback || "—"}
            </p>

            <p className="mt-3 font-bold text-blue-600">
              Score:{" "}
              {evalResult.rating !== undefined
                ? evalResult.rating + " / 5"
                : "—"}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-10">
        <button
          onClick={goBack}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
