import { useState } from "react";
import { explainCode } from "./api/explain";

type ExplanationStep = {
  step: number;
  node_type: string;
  explanation: string;
  line?: number; // NEW: line number support
};

function App() {
  const [code, setCode] = useState(`score = 0
bonus = 5
penalty = 2
limit = 100

if score < 20:
    score = score + 10
else:
    score = score + 3

for step in range(5):
    score = score + step

while score < 60:
    score = score + 4`);

  const [steps, setSteps] = useState<ExplanationStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleExplain = async () => {
    setLoading(true);
    const result = await explainCode(code);
    setSteps(result.steps || []);
    setLoading(false);
  };

  // 🔊 TEXT TO SPEECH
  const handleSpeak = () => {
    if (!steps.length) return;

    const fullText = steps.map((step) => step.explanation).join(". ");

    const speak = () => {
      const voices = window.speechSynthesis.getVoices();

      const preferredVoice =
        voices.find((v) => v.name.includes("Jenny")) ||
        voices.find((v) => v.name.includes("Aria")) ||
        voices.find((v) => v.name.includes("Google")) ||
        voices.find((v) => v.lang === "en-GB") ||
        voices.find((v) => v.lang === "en-US") ||
        voices[0];

      const speech = new SpeechSynthesisUtterance(fullText);
      speech.voice = preferredVoice;
      speech.rate = 0.9;
      speech.pitch = 1.05;
      speech.volume = 1;

      speech.onstart = () => setSpeaking(true);
      speech.onend = () => setSpeaking(false);

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(speech);
    };

    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.onvoiceschanged = speak;
    } else {
      speak();
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  // 🧠 GROUP EXPLANATIONS BY LINE (for clarity + minimum steps)
  const groupedByLine: { [key: number]: string[] } = {};
  steps.forEach((step) => {
    const lineNumber = step.line ?? step.step; // fallback if backend line missing
    if (!groupedByLine[lineNumber]) {
      groupedByLine[lineNumber] = [];
    }
    groupedByLine[lineNumber].push(step.explanation);
  });

  const codeLines = code.split("\n");

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #020617, #0f172a)",
        color: "#e5e7eb",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "38px", marginBottom: "6px" }}>
          Language-Agnostic Code Explainer
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "15px" }}>
          Static Analysis + Text-to-Speech Explanation System
        </p>
      </div>

      {/* SIDE BY SIDE LAYOUT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          height: "calc(100vh - 120px)",
        }}
      >
        {/* LEFT PANEL — NUMBERED CODE INPUT */}
        <div
          style={{
            background: "#020617",
            border: "1px solid #1e293b",
            borderRadius: "12px",
            padding: "18px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2 style={{ marginBottom: "12px", fontSize: "18px" }}>
            💻 Input Code
          </h2>

          {/* NUMBERED CODE BOX (NO UI CHANGE, JUST ENHANCED) */}
          <div
            style={{
              display: "flex",
              flex: 1,
              background: "#020617",
              border: "1px solid #334155",
              borderRadius: "10px",
              overflow: "hidden",
              fontFamily: "monospace",
            }}
          >
            {/* LINE NUMBERS */}
            <div
              style={{
                padding: "16px 10px",
                background: "#020617",
                color: "#64748b",
                textAlign: "right",
                userSelect: "none",
                borderRight: "1px solid #334155",
                lineHeight: "1.6",
                fontSize: "14px",
              }}
            >
              {codeLines.map((_, index) => (
                <div key={index}>{index + 1}</div>
              ))}
            </div>

            {/* TEXTAREA */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                flex: 1,
                padding: "16px",
                fontFamily: "monospace",
                fontSize: "14px",
                background: "#020617",
                color: "#e5e7eb",
                border: "none",
                outline: "none",
                resize: "none",
                lineHeight: "1.6",
              }}
            />
          </div>

          <button
            onClick={handleExplain}
            disabled={loading}
            style={{
              marginTop: "16px",
              padding: "12px",
              background: loading ? "#334155" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: "15px",
            }}
          >
            {loading ? "Analyzing Code..." : "Explain Code"}
          </button>
        </div>

        {/* RIGHT PANEL — LINE-WISE OUTPUT */}
        <div
          style={{
            background: "#f8fafc",
            color: "#0f172a",
            borderRadius: "12px",
            padding: "18px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
          }}
        >
          <h2 style={{ marginBottom: "12px", fontSize: "18px" }}>
            🧠 Explanation Output (Line-by-Line)
          </h2>

          {steps.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <button
                onClick={handleSpeak}
                disabled={speaking}
                style={{
                  padding: "8px 16px",
                  marginRight: "10px",
                  background: "#10b981",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                🔊 Listen Explanation
              </button>

              <button
                onClick={handleStop}
                style={{
                  padding: "8px 16px",
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                ⏹ Stop
              </button>
            </div>
          )}

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px",
              background: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              lineHeight: "1.8",
              fontSize: "15px",
            }}
          >
            {steps.length === 0 ? (
              <p style={{ color: "#64748b" }}>
                Explanation will appear here after you click "Explain Code".
              </p>
            ) : (
              Object.keys(groupedByLine)
                .sort((a, b) => Number(a) - Number(b))
                .map((line) => (
                  <div key={line} style={{ marginBottom: "12px" }}>
                    <strong>Line {line}:</strong>{" "}
                    {groupedByLine[Number(line)].join(". ")}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;