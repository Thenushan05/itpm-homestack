"use client";

import { useState, useRef, ChangeEvent } from "react";
import Tesseract from "tesseract.js";
import "../components/ImageToText.sass";

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

export default function ImageToText() {
  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<ExtractedData[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    const updatedItems = [...items];
    updatedItems[index].text = newText;
    setItems(updatedItems);
  };

  const handleAmountChange = (index: number, newAmount: string) => {
    const updatedItems = [...items];
    updatedItems[index].amount = "$" + newAmount.replace(/\D/g, ""); // Remove non-numeric characters and prepend $
    setItems(updatedItems);
  };

  const handleCategoryChange = (index: number, newCategory: string) => {
    const updatedItems = [...items];
    updatedItems[index].category = newCategory;
    setItems(updatedItems);
  };

  const handleSubmit = () => {
    if (image && items.length > 0) {
      setSubmittedData([...submittedData, { image, totalPrice, items }]);
      setImage(null);
      setItems([]);
      setTotalPrice(null);
      setExtractedText("");
    }
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
                value={item.text} // Only the description, without price
                onChange={(e) => handleTextChange(index, e.target.value)}
              />
              <input
                type="text"
                value={item.amount} // Display amount with currency symbol
                onChange={(e) =>
                  handleAmountChange(
                    index,
                    e.target.value.replace(/[^\d\.]/g, "")
                  )
                } // Clean the input to allow only numbers
                className="amount-input"
              />
              {item.category && (
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
              )}
            </div>
          ))}
          {totalPrice && <p>Total Price: {totalPrice}</p>}
          <button onClick={handleSubmit}>Submit</button>
        </div>
      )}
    </div>
  );
}
