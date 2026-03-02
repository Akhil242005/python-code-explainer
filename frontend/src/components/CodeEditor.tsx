import { useState } from "react";

function CodeInput({ code, setCode }) {
  const handleChange = (e) => {
    setCode(e.target.value);
  };

  const lines = code.split("\n");

  return (
    <div style={{ display: "flex" }}>
      {/* Line Numbers Column */}
      <div
        style={{
          background: "#111",
          color: "#888",
          padding: "10px",
          textAlign: "right",
          userSelect: "none",
          borderRight: "1px solid #333",
        }}
      >
        {lines.map((_, index) => (
          <div key={index}>{index + 1}</div>
        ))}
      </div>

      {/* Input Box (UNCHANGED UI FEEL) */}
      <textarea
        value={code}
        onChange={handleChange}
        placeholder="Type your Python code here..."
        style={{
          width: "100%",
          height: "300px",
          background: "#0f172a",
          color: "white",
          padding: "10px",
          border: "none",
          outline: "none",
          fontFamily: "monospace",
          fontSize: "14px",
          resize: "none",
        }}
      />
    </div>
  );
}

export default CodeInput;