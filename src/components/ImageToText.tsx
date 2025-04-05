"use client";

import { useState, useRef, ChangeEvent } from "react";
import Tesseract from "tesseract.js";
import axios from "axios";
import "../components/ImageToText.sass";

const categories = [
  "Food",
  "Electronics",
  "Utilities",
  "Entertainment",
  "Clothes", // Fixed typo from 'Clothing' to 'Clothes'
  "Shopping",
  "Other",
];

interface ExtractedItem {
  text: string;
  amount: string;
  category?: string;
}

interface AddItem {
  name: string;
  amount: number;
  date: string;
  category: string;
}

export default function ImageToText() {
  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [manualItem, setManualItem] = useState<AddItem>({
    name: "",
    amount: 0,
    date: new Date().toISOString(),
    category: "Other",
  });
  const [error, setError] = useState<string>("");
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const addToList = async (index: number) => {
    const newItem = items[index];
    if (!newItem.text.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/finance/",
        {
          name: newItem.text,
          amount: parseFloat(newItem.amount.replace("$", "")) || 0, // Ensure amount is stored correctly
          date: new Date().toISOString(),
          category: newItem.category || "Other",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data) {
        const updatedItems = items.filter((_, idx) => idx !== index);
        setItems(updatedItems);
        setImage(null); // Clear the image preview
        setExtractedText(""); // Clear the extracted text
        setLoading(false);
        showModalMessage("Item added successfully!");
      }
    } catch (err) {
      setLoading(false);
      setError("Failed to add item.");
    }
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result as string;
      setImage(imageData);
      extractText(imageData);
    };
    reader.readAsDataURL(file);
  };

  const extractText = (imageData: string) => {
    setLoading(true);
    Tesseract.recognize(imageData, "eng", {
      logger: (m) => console.log(m),
    }).then(({ data: { text } }) => {
      setExtractedText(text);
      setLoading(false);
    });
  };

  const processExtractedText = () => {
    const lines = extractedText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    const filteredItems = lines
      .filter(
        (line) =>
          /\$/i.test(line) &&
          !/total|change|cash|net amount|net amt/i.test(line)
      )
      .map((line) => {
        const priceMatch = line.match(/\$(\d+(\.\d{1,2})?)/);
        return {
          text: line.replace(/\$\d+(\.\d{1,2})?/, "").trim(),
          amount: priceMatch ? priceMatch[0] : "",
          category: "Other",
        };
      });

    setItems(filteredItems);
    showModalMessage("Items added from extracted text!");

    const totalLine = lines.find((line) =>
      /total|net amount|net amt/i.test(line)
    );
    if (totalLine) {
      const priceMatch = totalLine.match(/\$(\d+(\.\d{1,2})?)/);
      setTotalPrice(priceMatch ? priceMatch[0] : null);
    }
  };

  const handleTextChange = (index: number, newText: string) => {
    setItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = { ...updatedItems[index], text: newText };
      return updatedItems;
    });
  };

  const handleAmountChange = (index: number, newAmount: string) => {
    setItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = {
        ...updatedItems[index],
        amount: "$" + newAmount.replace(/[^\d\.]/g, ""),
      };
      return updatedItems;
    });
  };

  const handleCategoryChange = (index: number, newCategory: string) => {
    setItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = { ...updatedItems[index], category: newCategory };
      return updatedItems;
    });
  };

  const handleManualAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setManualItem((prev) => ({
      ...prev,
      amount: newValue === "" ? 0 : parseFloat(newValue) || 0,
    }));
  };

  const handleManualAdd = async () => {
    if (!manualItem.name.trim() || !manualItem.amount) {
      setError("Please enter a valid name and amount.");
      return;
    }

    const category = categories.includes(manualItem.category)
      ? manualItem.category
      : "Other";

    const payload = {
      name: manualItem.name.trim(),
      amount: Number(manualItem.amount), // Ensure amount is stored correctly without $
      date: new Date().toISOString(),
      category,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/finance/",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data) {
        setManualItem({
          name: "",
          amount: 0,
          date: new Date().toISOString(),
          category: "Other",
        });
        setError("");
        showModalMessage("Manual item added successfully!");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.error || "Failed to add manual item. Try again."
      );
    }
  };

  const showModalMessage = (message: string) => {
    setPopupMessage(message);
    setShowModal(true);
    setTimeout(() => {
      setShowModal(false);
    }, 3000);
  };

  return (
    <div className="image-to-text-container">
      {/* Modal for Success */}
      {showModal && (
        <div className="popup-modal">
          <div className="popup-content">
            <h3>{popupMessage}</h3>
            <button onClick={() => setShowModal(false)} className="close-btn">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Manual Input Section - Moved to the top */}
      <div className="manual-input-section">
        <h3>Manually Add Item</h3>
        <input
          type="text"
          placeholder="Item name"
          value={manualItem.name}
          onChange={(e) =>
            setManualItem((prev) => ({ ...prev, name: e.target.value }))
          }
        />
        <div className="amount-input-container">
          <span className="dollar-sign">$</span>
          <input
            type="number"
            placeholder="Amount"
            value={manualItem.amount === 0 ? "" : manualItem.amount} // Show empty when amount is 0
            onChange={handleManualAmountChange} // Call the new change handler
            className="amount-input"
            min="0"
          />
        </div>
        <select
          value={manualItem.category}
          onChange={(e) =>
            setManualItem((prev) => ({ ...prev, category: e.target.value }))
          }
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button onClick={handleManualAdd}>Add Manually</button>
      </div>

      {/* Upload Section */}
      <h2>Upload Bill (Image/PDF)</h2>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageUpload}
      />
      <button onClick={() => fileInputRef.current?.click()}>Upload</button>

      {image && <img src={image} alt="Uploaded" className="uploaded-image" />}
      {loading && <p>Processing...</p>}

      {extractedText && (
        <div className="extracted-text">
          <h3>Extracted Text</h3>
          <pre>{extractedText}</pre>
          <button onClick={processExtractedText}>Add to List</button>
        </div>
      )}

      {items.length > 0 && (
        <div className="editable-items">
          <h3>Filtered Items</h3>
          {items.map((item, index) => (
            <div key={index} className="item-row">
              <input
                type="text"
                value={item.text}
                onChange={(e) => handleTextChange(index, e.target.value)}
              />
              <div className="amount-input-container">
                <span className="dollar-sign">$</span>
                <input
                  type="text"
                  value={item.amount}
                  onChange={(e) => handleAmountChange(index, e.target.value)}
                  className="amount-input"
                />
              </div>
              <select
                value={item.category}
                onChange={(e) => handleCategoryChange(index, e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button onClick={() => addToList(index)}>Submit</button>
            </div>
          ))}
          {totalPrice && <p>Total Price: {totalPrice}</p>}
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}
