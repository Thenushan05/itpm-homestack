"use client";

import { useState, useRef, ChangeEvent } from "react";
import Tesseract from "tesseract.js";
import "../components/ImageToText.sass";
import axios from "axios";

const categories = ["Food", "Electronics", "Groceries", "Clothing", "Other"];

interface ExtractedItem {
  text: string;
  amount: string;
  category?: string;
}

interface ExtractedData {
  image: string;
  totalPrice: string | null;
  items: ExtractedItem[];
}

interface Additem {
  name: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
}

export default function ImageToText() {
  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<ExtractedData[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string>("");

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
          amount: parseFloat(newItem.amount.replace("$", "")) || 0,
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
        setItems([]);
        fileInputRef.current!.value = ""; // Clear the file input
        setImage(null); // Clear the image preview
        setError("");
        setExtractedText(""); // Clear the extracted text
        setLoading(false);
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

  return (
    <div className="image-to-text-container">
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
              <input
                type="text"
                value={item.amount}
                onChange={(e) => handleAmountChange(index, e.target.value)}
                className="amount-input"
              />
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
    </div>
  );
}
