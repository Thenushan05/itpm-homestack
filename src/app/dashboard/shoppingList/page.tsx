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
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const App: React.FC = () => {
  const [items, setItems] = useState<
    {
      _id: string;
      userId: string;
      itemName: string;
      count: number;
      price?: number;
      purchaseDate: string;
      fullName: string;
      homeName: string;
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isModalVisible, setIsModalVisible] = useState(false); // New state for modal visibility
  const [home, setHome] = useState("");
  const fetchItems = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token not found.");
        return;
      }

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const userId = decodedToken.id;

      const response1 = await axios.get(
        `http://localhost:5000/api/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setHome(response1.data.homeName || "");
      const response = await axios.get(
        `http://localhost:5000/api/purchases/home/${response1.data.homeName}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data.purchases) {
        setItems([]);
      } else {
        setItems(response.data.purchases);
      }
    } catch (err) {
      setError("Failed to fetch items.");
    }
  };

  useEffect(() => {
    fetchItems();
  }, [home]);

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
        setItems([...items, response.data.purchase]);
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const printPDF = () => {
    const doc = new jsPDF();
    const headers = ["Item", "Count", "Price", "Purchase Date"];

    const startX = 14;
    let startY = 30;
    const rowHeight = 10;
    const columnWidths = [50, 30, 40, 50];
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(240, 240, 240);
    doc.rect(startX, startY, columnWidths[0], rowHeight, "F");
    doc.rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight, "F");
    doc.rect(
      startX + columnWidths[0] + columnWidths[1],
      startY,
      columnWidths[2],
      rowHeight,
      "F"
    );
    doc.rect(
      startX + columnWidths[0] + columnWidths[1] + columnWidths[2],
      startY,
      columnWidths[3],
      rowHeight,
      "F"
    );
    doc.text(headers[0], startX + 5, startY + 7);
    doc.text(headers[1], startX + columnWidths[0] + 5, startY + 7);
    doc.text(
      headers[2],
      startX + columnWidths[0] + columnWidths[1] + 5,
      startY + 7
    );
    doc.text(
      headers[3],
      startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5,
      startY + 7
    );

    startY += rowHeight;
    const rowsPerPage = 10;
    let currentPage = 1;
    let currentItemIndex = 0;

    const drawRows = () => {
      while (
        currentItemIndex < items.length &&
        startY < doc.internal.pageSize.height - 30
      ) {
        const item = items[currentItemIndex];
        const rowData = [
          item.itemName,
          String(item.count),
          item.price ? `$${item.price.toFixed(2)}` : "-",
          new Date(item.purchaseDate).toLocaleDateString(),
        ];

        const isEvenRow = currentItemIndex % 2 === 0;
        doc.setFillColor(isEvenRow ? 255 : 245, 245, 245);
        doc.rect(startX, startY, columnWidths[0], rowHeight, "F");
        doc.rect(
          startX + columnWidths[0],
          startY,
          columnWidths[1],
          rowHeight,
          "F"
        );
        doc.rect(
          startX + columnWidths[0] + columnWidths[1],
          startY,
          columnWidths[2],
          rowHeight,
          "F"
        );
        doc.rect(
          startX + columnWidths[0] + columnWidths[1] + columnWidths[2],
          startY,
          columnWidths[3],
          rowHeight,
          "F"
        );

        doc.setTextColor(0, 0, 0);
        doc.text(rowData[0], startX + 5, startY + 7);
        doc.text(rowData[1], startX + columnWidths[0] + 5, startY + 7);
        doc.text(
          rowData[2],
          startX + columnWidths[0] + columnWidths[1] + 5,
          startY + 7
        );
        doc.text(
          rowData[3],
          startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5,
          startY + 7
        );

        startY += rowHeight;
        currentItemIndex++;

        if (startY > doc.internal.pageSize.height - 30) {
          doc.addPage();
          currentPage++;
          startY = 20;
          drawRows();
          break;
        }
      }
    };

    drawRows();

    const totalPages = doc.internal.pages.length;

    const currentDate = new Date();
    const dateString = `${currentDate.toLocaleString("default", {
      month: "long",
    })}_${currentDate.getDate()}_${currentDate.getFullYear()}`;

    doc.save(`shopping_list_${dateString}.pdf`);
  };

  const showModal = () => {
    setIsModalVisible(true); // Show the modal
  };

  const handleOk = () => {
    printPDF();
    setIsModalVisible(false); // Close the modal after downloading the PDF
  };

  const handleCancel = () => {
    setIsModalVisible(false); // Close the modal if cancel is clicked
  };

  return (
    <div className="container primary-bg primary-border">
      <h1 className="title primary-txt">🛒 Shopping List</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="input-container">
        <input
          type="text"
          value={manualInput || transcript}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="Type or speak to add an item..."
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

      {/* Print PDF Button */}
      <button onClick={showModal} className="print-pdf-button">
        Print PDF
      </button>

      {/* Modal for PDF download confirmation */}
      <Modal
        title="Download PDF"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Download"
        cancelText="Cancel"
      >
        <p>Are you sure you want to download the shopping list as a PDF?</p>
      </Modal>

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

      <table className="shopping-table primary-bg">
        <thead className="primary-bg">
          <tr>
            <th className="primary-bg">Item</th>
            <th className="primary-bg">Count</th>
            <th className="primary-bg">User</th>
            <th className="primary-bg">Purchase Date</th>
            <th className="primary-bg">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty">
                <Empty /> Your list is empty.
              </td>
            </tr>
          ) : (
            currentItems.map((item) => (
              <tr key={item._id}>
                <td>{item.itemName}</td>
                <td>{item.count}</td>
                <td>{item.fullName}</td>
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

      {/* Pagination */}
      {items.length > itemsPerPage && (
        <div className="pagination">
          {Array.from(
            { length: Math.ceil(items.length / itemsPerPage) },
            (_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={currentPage === index + 1 ? "active" : ""}
              >
                {index + 1}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default App;
