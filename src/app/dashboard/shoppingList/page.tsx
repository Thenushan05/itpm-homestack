"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import "regenerator-runtime/runtime";
import "../shoppingList/shoppinglist.sass";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { PlusCircleFilled } from "@ant-design/icons";
import { FaMicrophone, FaRegStopCircle } from "react-icons/fa";
import { HiRefresh } from "react-icons/hi";
import { Empty, Modal, Input, Button } from "antd";

const App: React.FC = () => {
  const [items, setItems] = useState<
    {
      _id: string;
      userId: string;
      itemName: string;
      count: number;
      price?: number;
      purchaseDate: string;
    }[]
  >([]);
  const { transcript, resetTranscript } = useSpeechRecognition();
  const [manualInput, setManualInput] = useState("");
  const [manualCount, setManualCount] = useState<string>("1");
  const [manualPrice, setManualPrice] = useState<string>("");
  const [editingIndex, setEditingIndex] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editCount, setEditCount] = useState<string>("");
  const [editPrice, setEditPrice] = useState<string>("");
  const [micStatus, setMicStatus] = useState("mic");
  const [error, setError] = useState<string>("");
  const userId = "USER_ID_HERE"; // Replace with dynamic user ID retrieval

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/purchases", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.data.purchases) {
        setItems([]);
      }

      setItems(response.data.purchases);
    } catch (err) {
      setError("Failed to fetch items.");
    }
  };

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

  const validateCount = (count: string) => {
    const parsedCount = parseInt(count, 10);
    return !isNaN(parsedCount) && parsedCount > 0;
  };

  const addToList = async () => {
    const itemToAdd = manualInput.trim() || transcript.trim();
    if (!itemToAdd) {
      setError("Item name cannot be empty.");
      return;
    }
    if (!validateCount(manualCount)) {
      setError("Count must be at least 1.");
      setManualCount("1");
      return;
    }

    const newItem = {
      itemName: itemToAdd,
      count: parseInt(manualCount, 10),
      price: manualPrice ? parseFloat(manualPrice) : undefined,
      purchaseDate: new Date().toISOString(),
    };
    try {
      const response = await axios.post(
        "http://localhost:5000/api/purchases/add",
        newItem,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data) {
        setItems([...items, response.data]);
        setManualInput("");
        setManualCount("1");
        setManualPrice("");
        resetTranscript();
        setError("");
      }
    } catch (err) {
      setError("Failed to add item.");
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/purchases/${id}`);
      setItems(items.filter((item) => item._id !== id));
    } catch (err) {
      setError("Failed to delete item.");
    }
  };

  const startEditing = (item: any) => {
    setEditingIndex(item._id);
    setEditText(item.itemName);
    setEditCount(item.count.toString());
    setEditPrice(item.price ? item.price.toString() : "");
  };

  const saveEdit = async () => {
    if (!editText || !validateCount(editCount)) {
      setError("Please fill out all fields correctly.");
      return;
    }

    const updatedItem = {
      itemName: editText,
      count: parseInt(editCount, 10),
      price: editPrice ? parseFloat(editPrice) : undefined,
      purchaseDate: new Date().toISOString(),
    };

    try {
      const response = await axios.put(
        `http://localhost:5000/api/purchases/${editingIndex}`,
        updatedItem,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data) {
        setItems(
          items.map((item) =>
            item._id === editingIndex ? response.data.updatedPurchase : item
          )
        );
        setEditingIndex(null);
        setEditText("");
        setEditCount("");
        setEditPrice("");
        setError("");
      }
    } catch (err) {
      setError("Failed to update item.");
    }
  };

  const closeModal = () => {
    setEditingIndex(null);
    setEditText("");
    setEditCount("");
    setEditPrice("");
  };

  return (
    <div className="container">
      <h1 className="title">🛒 Shopping List</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="input-container">
        <input
          type="text"
          value={manualInput || transcript}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="Type or speak add an item..."
          className="manual-input"
        />
        <button className="mic-button" onClick={toggleListening}>
          {micStatus === "mic" ? (
            <FaMicrophone className="mic-icon" />
          ) : micStatus === "stop" ? (
            <FaRegStopCircle />
          ) : (
            <HiRefresh />
          )}
        </button>
      </div>
      <input
        type="number"
        min="1"
        value={manualCount}
        onChange={(e) => setManualCount(e.target.value)}
        className="count-input"
        placeholder="Count"
      />
      <input
        type="number"
        min="0"
        value={manualPrice}
        onChange={(e) => setManualPrice(e.target.value)}
        className="price-input"
        placeholder="Price (Optional)"
      />
      <button onClick={addToList} className="manual-add">
        <PlusCircleFilled /> Add to List
      </button>

      {/* Edit Modal */}
      <Modal
        title="Edit Item"
        visible={editingIndex !== null}
        onCancel={closeModal}
        footer={[
          <Button key="cancel" onClick={closeModal}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={saveEdit}>
            Save Changes
          </Button>,
        ]}
      >
        <Input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          placeholder="Item Name"
        />
        <Input
          type="number"
          min="1"
          value={editCount}
          onChange={(e) => setEditCount(e.target.value)}
          placeholder="Count"
        />
        <Input
          type="number"
          min="0"
          value={editPrice}
          onChange={(e) => setEditPrice(e.target.value)}
          placeholder="Price (Optional)"
        />
      </Modal>

      <table className="shopping-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Count</th>
            <th>Price</th>
            <th>Purchase Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty">
                <Empty /> Your list is empty.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item._id}>
                <td>{item.itemName}</td>
                <td>{item.count}</td>
                <td>{item.price ? `$${item.price.toFixed(2)}` : "-"}</td>
                <td>{new Date(item.purchaseDate).toLocaleDateString()}</td>
                <td>
                  <button
                    className="delete"
                    onClick={() => deleteItem(item._id)}
                  >
                    ❌
                  </button>
                  <button className="edit" onClick={() => startEditing(item)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default App;
