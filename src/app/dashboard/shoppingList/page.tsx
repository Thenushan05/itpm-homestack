"use client";
import React, { useState } from "react";
import "regenerator-runtime/runtime";
import "../shoppingList/shoppinglist.sass";

import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const App: React.FC = () => {
  const [items, setItems] = useState<string[]>([]);
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const [manualInput, setManualInput] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [micStatus, setMicStatus] = useState("mic"); // 'mic', 'stop', 'reset'

  const toggleListening = () => {
    if (micStatus === "mic") {
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
      setMicStatus("stop");
    } else if (micStatus === "stop") {
      SpeechRecognition.stopListening();
      setMicStatus("reset");
    } else {
      resetTranscript();
      setMicStatus("mic");
    }
  };

  const addToList = () => {
    if (manualInput.trim()) {
      setItems((prevItems) => [...prevItems, manualInput.trim()]);
      setManualInput("");
    }
  };

  const deleteItem = (index: number) => {
    setItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditText(items[index]);
  };

  const updateItem = () => {
    if (editingIndex !== null) {
      setItems((prevItems) =>
        prevItems.map((item, index) =>
          index === editingIndex ? editText : item
        )
      );
      setEditingIndex(null);
      setEditText("");
    }
  };

  return (
    <div className="container">
      <h1 className="title">🛒 Shopping List (Voice & Manual Input)</h1>

      <div className="input-container">
        <input
          type="text"
          value={transcript || manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="Type or speak an item..."
          className="manual-input"
        />
        <button className="mic-button" onClick={toggleListening}>
          {micStatus === "mic" && "🎤"}
          {micStatus === "stop" && "⏹"}
          {micStatus === "reset" && "🔄"}
        </button>
      </div>

      <button onClick={addToList} className="manual-add">
        ➕ Add to List
      </button>

      <h2 className="list-title">📝 Shopping List:</h2>
      <ul className="shopping-list">
        {items.length === 0 ? (
          <p className="empty">Your list is empty. Start adding items!</p>
        ) : (
          items.map((item, index) => (
            <li key={index} className="list-item">
              {editingIndex === index ? (
                <>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="edit-input"
                  />
                  <button className="save" onClick={updateItem}>
                    💾 Save
                  </button>
                </>
              ) : (
                <>
                  {item}
                  <button className="edit" onClick={() => startEditing(index)}>
                    ✏ Edit
                  </button>
                  <button className="delete" onClick={() => deleteItem(index)}>
                    ❌
                  </button>
                </>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default App;
