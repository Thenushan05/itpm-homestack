// "use client";
// import React, { useState } from 'react';
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
// import "regenerator-runtime/runtime";
// import dynamic from "next/dynamic";

// const ShoppingList = () => {
//   // Define the state as an array of strings (shopping list items)
//   const [items, setItems] = useState<string[]>([]);
//   const { transcript, resetTranscript, listening } = useSpeechRecognition();

//   const addItemToList = () => {
//     // // Ensure transcript is not empty before adding it to the list
//     // if (transcript && transcript.trim() !== "") {
//     //   setItems((prevItems) => [...prevItems, transcript]);
//     //   resetTranscript();
//     // }
//   };

// const startListnening =() =>{
//   // SpeechRecognition.startListening().then((res)=>{
//   //   console.log("res",res);

//   // })
// }

//   return (
//     <div style={{ padding: '20px' }}>
//       <h1>Shopping List</h1>

//       <ul style={{ listStyleType: 'none', padding: 0 }}>
//         {items.map((item, index) => (
//           <li key={index} style={{ padding: '5px', fontSize: '18px' }}>
//             {item}
//           </li>
//         ))}
//       </ul>

//       <div>
//         <button
//           onClick={startListnening}
//           // disabled={listening}
//           style={{
//             padding: '10px 20px',
//             backgroundColor: '#4CAF50',
//             color: 'white',
//             border: 'none',
//             cursor: 'pointer',
//             marginRight: '10px',
//           }}
//         >
//           Start Listening
//         </button>

//         <button
//           // onClick={SpeechRecognition.stopListening}
//           // disabled={!listening}
//           style={{
//             padding: '10px 20px',
//             backgroundColor: '#f44336',
//             color: 'white',
//             border: 'none',
//             cursor: 'pointer',
//           }}
//         >
//           Stop Listening
//         </button>
//       </div>

//       <p style={{ marginTop: '20px', fontSize: '18px' }}>
//         {/* <strong>Current speech input:</strong> {transcript} */}
//       </p>

//       <button
//         onClick={addItemToList}
//         style={{
//           padding: '10px 20px',
//           backgroundColor: '#2196F3',
//           color: 'white',
//           border: 'none',
//           cursor: 'pointer',
//         }}
//       >
//         Add Item to List
//       </button>
//     </div>
//   );
// };

// const Home = () => {
//   return (
//     <div>
//       <ShoppingList />
//     </div>
//   );
// };

// export default Home;

"use client";

import "regenerator-runtime/runtime"; // ✅ Fix regeneratorRuntime error
import React, { useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const ShoppingList = () => {
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

export default ShoppingList;
