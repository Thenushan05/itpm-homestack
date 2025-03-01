"use client";

import { useState, useRef, ChangeEvent } from "react";
import Tesseract from "tesseract.js";
import "../components/ImageToText.sass";

interface ExtractedData {
  image: string;
  totalPrice: string | null;
}

export default function ImageToText() {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string>("");
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
      setText(text);
      setLoading(false);
    });
  };

  // Function to extract the total price from lines containing "$", "LKR", "net amount" or "net amt"
  const getTotalPrice = (text: string) => {
    const lines = text.split("\n");

    // Find lines that contain "total", "net amount", "net amt", "$", or "LKR" and avoid "subtotal"
    const totalLine = lines.find(
      (line) =>
        /total|net\s?amount|net\s?amt/i.test(line) &&
        (/\$|LKR/.test(line) || !/\$|LKR/.test(line)) &&
        !/subtotal/i.test(line)
    );

    if (totalLine) {
      // Extract the price from the total line
      const pricePattern =
        /\$?\d+(\.\d{1,2})?|\bLKR\b\s?\d+(\.\d{1,2})?|\d+(\.\d{1,2})?/g; // Regex for prices with "$", "LKR", or plain numbers
      const prices = totalLine.match(pricePattern);
      return prices ? prices[0] : null; // Return the first match (expected to be the total price)
    }
    return null; // If no valid total line is found
  };

  const openCamera = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = () => {
    setImage(null);
    setText("");
    // Reset the file input so the same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // This is the fix
    }
  };

  const handleSubmit = () => {
    if (image && text) {
      const totalPrice = getTotalPrice(text);
      if (totalPrice) {
        setSubmittedData([
          ...submittedData,
          { image: image, totalPrice: totalPrice }, // Save only the total price
        ]);
        handleDelete(); // Clear after submit
      }
    }
  };

  const handleDeleteSubmission = (index: number) => {
    setSubmittedData(submittedData.filter((_, i) => i !== index));
  };

  return (
    <div className="image-to-text-container">
      <h2 className="heading">Upload Bill (Image/PDF)</h2>
      <input
        type="file"
        accept="image/*,application/pdf"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="file-input"
      />
      <button onClick={openCamera} className="btn-upload">
        Open Camera / Upload
      </button>

      {image && (
        <div className="image-preview">
          <img src={image} alt="Uploaded" className="image" />
          <button onClick={handleDelete} className="btn-delete">
            Delete Image
          </button>
        </div>
      )}

      {loading && <p className="loading">Processing...</p>}

      {text && (
        <div className="text-extracted">
          <h3 className="text-title">Extracted Text:</h3>
          <pre className="text-content">{text}</pre>
        </div>
      )}

      {image && text && (
        <button onClick={handleSubmit} className="btn-submit">
          Submit Total Price
        </button>
      )}

      {submittedData.length > 0 && (
        <div className="submitted-data">
          <h3 className="submitted-title">Submitted Data</h3>
          {submittedData.map((data, index) => (
            <div key={index} className="submitted-item">
              <div className="submitted-image-container">
                <img
                  src={data.image}
                  alt="Submitted"
                  className="submitted-image"
                />
              </div>
              <div className="submitted-text">
                {data.totalPrice && (
                  <div className="prices">
                    <span className="prices-label">Total Price:</span>
                    <span className="total-price">{data.totalPrice}</span>
                  </div>
                )}
                <button
                  onClick={() => handleDeleteSubmission(index)}
                  className="btn-delete-submission"
                >
                  Delete Submission
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
