"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import "regenerator-runtime/runtime";
import "../shoppingList/shoppinglist.sass";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { PlusCircleFilled } from "@ant-design/icons";
import { FaEdit, FaMicrophone, FaRegStopCircle, FaTrash } from "react-icons/fa";
import { HiRefresh } from "react-icons/hi";
import { Empty, Modal, Input, Button, Select, Pagination } from "antd";
import { jsPDF } from "jspdf";
import { AiOutlineStop } from "react-icons/ai";
import { MdInventory, MdOutlineProductionQuantityLimits } from "react-icons/md";
import { IoMdPrint } from "react-icons/io";

interface Additem {
  itemName: string;
  count: string;
  price?: number;
  purchaseDate: string;
  fullName?: string;
  homeName?: string;
  category: string;
}
const App: React.FC = () => {
  const [items, setItems] = useState<
    {
      _id: string;
      userId: string;
      itemName: string;
      count: string;
      price?: number;
      purchaseDate: string;
      fullName: string;
      homeName: string;
      category: string;
    }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { transcript, resetTranscript } = useSpeechRecognition();
  const [manualInput, setManualInput] = useState("");
  const [manualCount, setManualCount] = useState<string>("1");
  const [manualPrice, setManualPrice] = useState<string>("");
  const [manualCategory, setManualCategory] = useState<string>("");
  const [editingIndex, setEditingIndex] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editCount, setEditCount] = useState<string>("");
  const [editPrice, setEditPrice] = useState<string>("");
  const [micStatus, setMicStatus] = useState("mic");
  const [error, setError] = useState<string>("");
  // const userId = "USER_ID_HERE"; // Replace with dynamic user ID retrieval
  const itemsPerPage = 10;
  const [isModalVisible, setIsModalVisible] = useState(false); // New state for modal visibility
  const [home, setHome] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token not found.");
        return;
      }

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const userIdFromToken = decodedToken.id; // Extract userId from token
      console.log("User ID from token:", userIdFromToken); // Debug log

      const response1 = await axios.get(
        `http://localhost:5000/api/user/${userIdFromToken}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setHome(response1.data.homeName || "");
      setUserId(userIdFromToken); // Set state for userId

      const response = await axios.get(
        `http://localhost:5000/api/purchases/home/${response1.data.homeName}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { currentPage: currentPage, pageSize: itemsPerPage },
        }
      );

      if (!response.data.purchases) {
        setItems([]);
      } else {
        setItems(response.data.purchases);

        setTotalItems(response.data.totalItems);
      }
    } catch (err) {
      setError("Failed to fetch items.");
    }
  };

  useEffect(() => {
    fetchItems();
  }, [home, currentPage]);

  const deleteAllPurchases = async () => {
    try {
      if (!home) {
        setError("Home name not found.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token not found.");
        return;
      }

      const response = await axios.delete(
        `http://localhost:5000/api/purchases/home/${home}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setItems([]); // Clear the shopping list
        setTotalItems(0);
        setError("");
        alert("All purchases deleted successfully.");
      }
    } catch (err) {
      setError("Failed to delete purchases.");
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

    const newItem: Additem = {
      itemName: itemToAdd,
      count: manualCount,
      price: manualPrice ? parseFloat(manualPrice) : undefined,
      purchaseDate: new Date().toISOString(),
      category: manualCategory,
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

  const printPDF = () => {
    const doc = new jsPDF();
    const headers = ["Item", "Count", "fullName", "Purchase Date"];

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
          item.fullName,
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

  const currentItems = items.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const { Option } = Select;

  return (
    <div className="container primary-bg primary-border">
      <h1 className="title primary-txt">🛒 Shopping List</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="group-container">
        <div className="add-item-container-main">
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
          <div className="count-category-container">
            <input
              type="string"
              min="1"
              value={manualCount}
              onChange={(e) => setManualCount(e.target.value)}
              className="count-input"
              placeholder="Count"
            />
            <div className="category-select-container">
              <Select
                className="category-select"
                defaultValue="Select Category"
                style={{ width: 200 }}
                onChange={(e) => setManualCategory(e)}
              >
                <Option value="entertainment">entertainment</Option>
                <Option value="clothing">clothing</Option>
                <Option value="other">other</Option>
              </Select>
            </div>
          </div>
          <button onClick={addToList} className="manual-add">
            <PlusCircleFilled /> Add to List
          </button>
        </div>

        <div className="list-container">
          <div className="search-print-container">
            <button onClick={deleteAllPurchases} className="delete-all-button">
              <FaTrash /> Delete All
            </button>

            <button onClick={showModal} className="print-pdf-button">
              <IoMdPrint /> Print PDF
            </button>
          </div>
          <Input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-bar"
          />
          {currentItems.length === 0 ? (
            <>
              <Empty /> Your list is empty.
            </>
          ) : (
            currentItems.map((item) => (
              <div className="list-container-sub">
                <div className="item-inner">
                  <div className="item-name-category">
                    <div className="item-name">
                      <MdInventory className="item-icon" /> {item.itemName}
                      <div
                        className={
                          "category " + "bg-" + item.category.toLowerCase()
                        }
                      >
                        {" "}
                        {item.category}
                      </div>
                    </div>
                  </div>
                  <div className="item-name-user">
                    <div className="count"> Qty:{item.count}</div>
                    <div className="name"> {item.fullName}</div>
                    <div className="date">
                      {new Date(item.purchaseDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="buttons-container">
                  {item.userId === userId ? (
                    <>
                      <button
                        className="deletebtn"
                        onClick={() => deleteItem(item._id)}
                      >
                        <FaTrash />
                      </button>
                      <button
                        className="editbtn"
                        onClick={() => startEditing(item)}
                      >
                        <FaEdit />
                      </button>
                    </>
                  ) : (
                    <Button className="disabled" disabled>
                      <AiOutlineStop />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Print PDF Button */}

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
      {error && <p className="error-message">{error}</p>}

      {/* Pagination */}
      <Pagination
        current={currentPage}
        onChange={(page) => setCurrentPage(page)}
        total={totalItems}
      />
    </div>
  );
};

export default App;
