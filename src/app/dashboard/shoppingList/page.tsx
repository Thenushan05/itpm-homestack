"use client";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "regenerator-runtime/runtime";
import "../shoppingList/shoppinglist.sass";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import {
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  PrinterOutlined,
  AudioOutlined,
  StopOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import {
  Empty,
  Modal,
  Input,
  Button,
  Select,
  Pagination,
  Card,
  Typography,
  Tag,
  Space,
  Tooltip,
  Alert,
  Layout,
  theme,
  Popconfirm,
  Avatar,
} from "antd";
import { jsPDF } from "jspdf";
import { MdInventory } from "react-icons/md";

const { Title, Text } = Typography;
const { Header, Content } = Layout;
const { Option } = Select;

interface ShoppingItem {
  _id: string;
  userId: UserData;
  itemName: string;
  count: string;
  price?: number;
  purchaseDate: string;
  fullName: string;
  homeName: string;
  category: string;
}
interface UserData {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  homeName: string;
  role: string;
  profilePhoto?: string; // URL to the profile photo
}

const categories = [
  { value: "groceries", label: "Groceries", color: "green" },
  { value: "household", label: "Household", color: "blue" },
  { value: "electronics", label: "Electronics", color: "purple" },
  { value: "clothing", label: "Clothing", color: "pink" },
  { value: "other", label: "Other", color: "orange" },
];

const App: React.FC = () => {
  const { token } = theme.useToken();
  const [items, setItems] = useState<ShoppingItem[]>([]);
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [home, setHome] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("date");
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;
  const [userId, setUserId] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token not found.");
        return;
      }

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const userIdFromToken = decodedToken.id;

      const response1 = await axios.get(
        `http://localhost:5000/api/user/${userIdFromToken}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setHome(response1.data.homeName || "");
      setUserId(userIdFromToken);

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
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch items."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [home, currentPage]);

  const deleteAllPurchases = async () => {
    try {
      setLoading(true);
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
        setItems([]);
        setTotalItems(0);
        setError("");
        alert("All purchases deleted successfully.");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete purchases."
      );
    } finally {
      setLoading(false);
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

    const newItem: ShoppingItem = {
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

  const startEditing = (item: ShoppingItem) => {
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
    setIsModalVisible(true);
  };

  const handleOk = () => {
    printPDF();
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (searchQuery) {
      result = result.filter((item) =>
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((item) =>
        selectedCategories.includes(item.category)
      );
    }

    switch (sortBy) {
      case "date":
        result.sort(
          (a, b) =>
            new Date(b.purchaseDate).getTime() -
            new Date(a.purchaseDate).getTime()
        );
        break;
      case "name":
        result.sort((a, b) => a.itemName.localeCompare(b.itemName));
        break;
      case "price":
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
    }

    return result;
  }, [items, searchQuery, selectedCategories, sortBy]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const getAvatarUrl = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=random&color=fff&size=40&bold=true`;
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header className="bg-white shadow-sm px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center">
          <ShoppingCartOutlined className="text-2xl text-blue-500 mr-3" />
          <Title level={4} className="!m-0 !text-gray-800">
            Shopping List
          </Title>
        </div>
        <Space>
          <Button
            icon={<PrinterOutlined />}
            onClick={printPDF}
            type="default"
            className="hover:bg-gray-50"
          >
            Export PDF
          </Button>
          <Popconfirm
            title="Clear All Items"
            description="Are you sure you want to delete all items? This action cannot be undone."
            onConfirm={deleteAllPurchases}
            okText="Yes"
            cancelText="No"
            placement="bottomRight"
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              className="hover:opacity-90"
            >
              Clear All
            </Button>
          </Popconfirm>
        </Space>
      </Header>

      <Content className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Add new item..."
                  value={manualInput || transcript}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="flex-1"
                  size="large"
                  prefix={<ShoppingCartOutlined className="text-blue-400" />}
                />
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={manualCount}
                  onChange={(e) => setManualCount(e.target.value)}
                  style={{ width: 100 }}
                  size="large"
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                  prefix="$"
                  style={{ width: 120 }}
                  size="large"
                />
                <Select
                  placeholder="Category"
                  value={manualCategory}
                  onChange={setManualCategory}
                  style={{ width: 150 }}
                  size="large"
                >
                  {categories.map((cat) => (
                    <Option key={cat.value} value={cat.value}>
                      <Tag color={cat.color}>{cat.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Space>
                  <Tooltip
                    title={
                      micStatus === "mic"
                        ? "Start Recording"
                        : micStatus === "stop"
                        ? "Stop Recording"
                        : "Reset"
                    }
                  >
                    <Button
                      icon={
                        micStatus === "mic" ? (
                          <AudioOutlined />
                        ) : micStatus === "stop" ? (
                          <StopOutlined />
                        ) : (
                          <ReloadOutlined />
                        )
                      }
                      onClick={toggleListening}
                      type={micStatus === "stop" ? "primary" : "default"}
                      size="large"
                      className={
                        micStatus === "stop"
                          ? "bg-blue-500 hover:bg-blue-600"
                          : ""
                      }
                    >
                      {micStatus === "mic"
                        ? "Start Voice Input"
                        : micStatus === "stop"
                        ? "Stop"
                        : "Reset"}
                    </Button>
                  </Tooltip>
                </Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={addToList}
                  size="large"
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Add Item
                </Button>
              </div>

              {error && (
                <Alert type="error" message={error} showIcon closable />
              )}
            </div>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                prefix={<SearchOutlined className="text-gray-400" />}
                style={{ width: 300 }}
                size="large"
                allowClear
              />
              <Space size="large">
                <Select
                  placeholder="Sort by"
                  style={{ width: 150 }}
                  defaultValue="date"
                  size="large"
                >
                  <Option value="date">Date Added</Option>
                  <Option value="name">Name</Option>
                  <Option value="price">Price</Option>
                </Select>
                <Select
                  placeholder="Filter Category"
                  style={{ width: 200 }}
                  mode="multiple"
                  size="large"
                  maxTagCount={2}
                >
                  {categories.map((cat) => (
                    <Option key={cat.value} value={cat.value}>
                      <Tag color={cat.color}>{cat.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Space>
            </div>
          </Card>

          <Card
            className="shadow-sm hover:shadow-md transition-shadow duration-200"
            loading={loading}
          >
            {filteredAndSortedItems.length > 0 ? (
              <div className="space-y-4">
                {filteredAndSortedItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all duration-200"
                  >
                    {editingIndex === item._id ? (
                      <div className="flex-1 flex items-center space-x-4">
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-1"
                          size="large"
                        />
                        <Input
                          type="number"
                          value={editCount}
                          onChange={(e) => setEditCount(e.target.value)}
                          style={{ width: 100 }}
                          size="large"
                        />
                        <Input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          prefix="$"
                          style={{ width: 120 }}
                          size="large"
                        />
                        <Space>
                          <Button
                            type="primary"
                            onClick={saveEdit}
                            size="large"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingIndex(null)}
                            size="large"
                          >
                            Cancel
                          </Button>
                        </Space>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Avatar
                              size={40}
                              src={`http://localhost:5000${item.userId.profilePhoto}`}
                              style={{
                                backgroundColor: item.fullName
                                  ? undefined
                                  : "#1890ff",
                                verticalAlign: "middle",
                              }}
                              className="flex-shrink-0 border-2 border-blue-100"
                            >
                              {item.fullName
                                ? item.fullName[0].toUpperCase()
                                : "?"}
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <Text strong className="text-lg block truncate">
                                {item.itemName}
                              </Text>
                              <div className="flex items-center space-x-2 mt-1">
                                <Text type="secondary" className="text-sm">
                                  Added by {item.fullName || "Unknown User"}
                                </Text>
                                <Tag
                                  color={
                                    categories.find(
                                      (cat) => cat.value === item.category
                                    )?.color || "default"
                                  }
                                  className="px-3 py-1"
                                >
                                  {item.category || "Uncategorized"}
                                </Tag>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 mt-2 space-x-4 ml-12">
                            <span className="inline-flex items-center">
                              <span className="mr-1">📦</span> Quantity:{" "}
                              {item.count}
                            </span>
                            {item.price && (
                              <span className="inline-flex items-center">
                                <span className="mr-1">💰</span> Price: $
                                {item.price}
                              </span>
                            )}
                            <span className="inline-flex items-center">
                              <span className="mr-1">📅</span> Added:{" "}
                              {new Date(item.purchaseDate).toLocaleDateString()}
                            </span>
                            <span className="inline-flex items-center">
                              <span className="mr-1">🏠</span> Home:{" "}
                              {item.homeName}
                            </span>
                          </div>
                        </div>
                        <Space size="middle">
                          <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => startEditing(item)}
                            className="hover:opacity-90"
                          >
                            Edit
                          </Button>
                          <Popconfirm
                            title="Delete item"
                            description="Are you sure you want to delete this item?"
                            onConfirm={() => deleteItem(item._id)}
                            okText="Yes"
                            cancelText="No"
                            placement="left"
                          >
                            <Button
                              type="primary"
                              danger
                              icon={<DeleteOutlined />}
                              className="hover:opacity-90"
                            >
                              Delete
                            </Button>
                          </Popconfirm>
                        </Space>
                      </>
                    )}
                  </div>
                ))}
                <div className="flex justify-center mt-6">
                  <Pagination
                    current={currentPage}
                    total={totalItems}
                    pageSize={itemsPerPage}
                    onChange={paginate}
                    showSizeChanger={false}
                    className="hover:shadow-sm transition-shadow"
                  />
                </div>
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Text type="secondary" className="text-lg">
                    No items in your shopping list
                  </Text>
                }
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={showModal}
                  size="large"
                  className="mt-4"
                >
                  Add Your First Item
                </Button>
              </Empty>
            )}
          </Card>
        </div>
      </Content>

      <Modal
        title={<Text strong>Add New Item</Text>}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
        className="rounded-lg"
      >
        <div className="space-y-4 py-4">
          <Input
            placeholder="Item name"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            size="large"
          />
          <Input
            type="number"
            placeholder="Quantity"
            value={manualCount}
            onChange={(e) => setManualCount(e.target.value)}
            size="large"
          />
          <Input
            type="number"
            placeholder="Price (optional)"
            value={manualPrice}
            onChange={(e) => setManualPrice(e.target.value)}
            prefix="$"
            size="large"
          />
          <Select
            placeholder="Select category"
            value={manualCategory}
            onChange={setManualCategory}
            style={{ width: "100%" }}
            size="large"
          >
            {categories.map((cat) => (
              <Option key={cat.value} value={cat.value}>
                <Tag color={cat.color}>{cat.label}</Tag>
              </Option>
            ))}
          </Select>
        </div>
      </Modal>
    </Layout>
  );
};

export default App;
