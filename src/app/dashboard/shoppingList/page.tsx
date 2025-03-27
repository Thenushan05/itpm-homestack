"use client";
import React, { useState } from "react";
import "regenerator-runtime/runtime";

import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const App: React.FC = () => {
  const [items, setItems] = useState<string[]>([]);
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const [canAdd, setCanAdd] = useState(false);
  const [isStart, setIsStart] = useState(false);

  const startListening = () => {
    setIsStart(true);
    SpeechRecognition.startListening({ continuous: true, language: "en-US" });
    setCanAdd(false);
  };

  const stopListening = () => {
    setIsStart(false);
    SpeechRecognition.stopListening();
    setCanAdd(true);
  };

  const addToList = () => {
    if (transcript) {
      setItems((prevItems) => [...prevItems, transcript]);
      resetTranscript();
      setCanAdd(false);
    }
  };

  const resetSpeech = () => {
    resetTranscript();
    setCanAdd(false);
  };

  const deleteItem = (index: number) => {
    setItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  return (
    <div className="container">
      <h1 className="title">🛒 Shopping List (Voice to Text)</h1>

      <div className="buttons">
        <button onClick={startListening} disabled={listening} className="start">
          🎙 Start Listening
        </button>
        <button onClick={stopListening} disabled={!listening} className="stop">
          ⏹ Stop
        </button>
        <button onClick={addToList} disabled={!canAdd} className="add">
          ➕ Add to List
        </button>
        <button onClick={resetSpeech} className="reset">
          🔄 Reset Speech
        </button>
      </div>

      <h2 className="transcript">
        {isStart && (
          <>
            🗣 Current Speech: <span>{transcript || "Say something..."}</span>
          </>
        )}
      </h2>

      <h2 className="list-title">📝 Shopping List:</h2>
      <ul className="shopping-list">
        {items.length === 0 ? (
          <p className="empty">Your list is empty. Start adding items!</p>
        ) : (
          items.map((item, index) => (
            <li key={index} className="list-item">
              {item}
              <button className="delete" onClick={() => deleteItem(index)}>
                ❌
              </button>
            </li>
          ))
        )}
      </ul>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .container {
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          text-align: center;
          padding: 20px;
        }
        .title {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 20px;
          color: #343a40;
        }
        .buttons {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }
        button {
          padding: 12px 18px;
          font-size: 18px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.3s ease;
        }
        .start {
          background: #28a745;
          color: white;
        }
        .stop {
          background: #dc3545;
          color: white;
        }
        .add {
          background: #007bff;
          color: white;
        }
        .reset {
          background: #ffc107;
          color: black;
        }
        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .transcript {
          font-size: 20px;
          margin-bottom: 20px;
          color: #495057;
        }
        .list-title {
          font-size: 24px;
          font-weight: bold;
          color: #343a40;
          margin-top: 15px;
        }
        .shopping-list {
          width: 100%;
          max-width: 500px;
          list-style: none;
          padding: 0;
        }
        .empty {
          font-size: 18px;
          color: #6c757d;
        }
        .list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 12px;
          margin: 8px 0;
          border-radius: 6px;
          box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
          font-size: 18px;
        }
        .delete {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default App;
