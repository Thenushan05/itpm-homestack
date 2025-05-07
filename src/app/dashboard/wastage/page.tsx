"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  Card,
  Row,
  Col,
  Button,
  Empty,
  Progress,
  Typography,
  Space,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  BarChartOutlined,
  SyncOutlined,
  EditOutlined,
} from "@ant-design/icons";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const { Title: AntTitle, Text } = Typography;

const WasteManagement: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    amount: "",
    unit: "",
    isRecyclable: false,
  });
  const [showForm, setShowForm] = useState(false); // State to control form visibility
  const [toastMessage, setToastMessage] = useState(""); // State for toast message
  const [wasteDetails, setWasteDetails] = useState<
    Array<{
      _id: string;
      name: string;
      category: string;
      amount: number;
      unit: string;
      isRecyclable: boolean;
    }>
  >([]); // State to hold waste details
  const maxWaste = 150; // Max waste for full height
  const warningThreshold = maxWaste - 50; // 100 kg threshold
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Calculate total waste amount
  const totalAmount = wasteDetails.reduce(
    (sum, waste) => sum + waste.amount,
    0
  );

  // Calculate the exact fill height in percentage (0% to 100%)
  const binFill = (totalAmount / maxWaste) * 100;

  // Determine fill color based on waste level
  const fillColor =
    totalAmount >= maxWaste
      ? "rgba(255, 0, 0, 0.8)" // Red (Danger)
      : totalAmount >= warningThreshold
      ? "rgba(255, 165, 0, 0.8)" // Orange (Warning)
      : "rgba(0, 128, 255, 0.8)"; // Blue (Safe)

  const categories = ["Plastic", "Paper", "Glass", "Metal", "Other"];
  const units = ["kg", "g", "lb", "oz"]; // Sample units for the dropdown

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingIndex !== null) {
        // Update existing record
        const wasteToUpdate = wasteDetails[editingIndex];
        const response = await fetch(
          `http://localhost:5000/api/waste/update/${wasteToUpdate._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );
        if (response.ok) {
          const updatedWaste = await response.json();
          const newWasteDetails = [...wasteDetails];
          newWasteDetails[editingIndex] = updatedWaste;
          setWasteDetails(newWasteDetails);
          setToastMessage("Wastage updated successfully");
        }
      } else {
        // Add new record
        const response = await fetch("http://localhost:5000/api/waste/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        console.log("API Response:", data);
        setToastMessage("Wastage added successfully");
      }
      // Clear the form after successful submission
      setFormData({
        name: "",
        category: "",
        amount: "",
        unit: "",
        isRecyclable: false,
      });
      setShowForm(false); // Hide the form after submission
      setTimeout(() => setToastMessage(""), 3000); // Clear toast message after 3 seconds
      fetchWasteDetails(); // Fetch updated waste details
      setEditingIndex(null); // Reset editing index
    } catch (error) {
      console.error("Error saving waste details:", error);
    }
  };

  const fetchWasteDetails = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/waste/details");
      const data = await response.json();
      setWasteDetails(data);
    } catch (error) {
      console.error("Error fetching waste details:", error);
    }
  };

  useEffect(() => {
    fetchWasteDetails(); // Fetch waste details on component mount
  }, []);

  // Calculate recyclable waste amount
  const recyclableAmount = wasteDetails
    .filter((waste) => waste.isRecyclable)
    .reduce((sum, waste) => sum + waste.amount, 0);

  // Prepare data for the bar graph
  const chartData = {
    labels: categories,
    datasets: [
      {
        label: "Waste Amount (kg)",
        data: categories.map((category) => {
          return wasteDetails
            .filter((waste) => waste.category === category)
            .reduce((sum, waste) => sum + waste.amount, 0);
        }),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for the pie chart
  const pieChartData = {
    labels: categories,
    datasets: [
      {
        data: categories.map((category) => {
          return wasteDetails
            .filter((waste) => waste.category === category)
            .reduce((sum, waste) => sum + waste.amount, 0);
        }),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const handleDelete = async (index: number) => {
    const wasteToDelete = wasteDetails[index];
    try {
      const response = await fetch(
        `http://localhost:5000/api/waste/delete/${wasteToDelete._id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setWasteDetails(wasteDetails.filter((_, i) => i !== index));
        setToastMessage("Wastage deleted successfully");
        setTimeout(() => setToastMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error deleting waste details:", error);
    }
  };

  const handleEdit = (index: number) => {
    const wasteToEdit = wasteDetails[index];
    setFormData({
      name: wasteToEdit.name,
      category: wasteToEdit.category,
      amount: wasteToEdit.amount.toString(),
      unit: wasteToEdit.unit,
      isRecyclable: wasteToEdit.isRecyclable,
    });
    setEditingIndex(index); // Set the editing index
    setShowForm(true);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
      {/* Header Section */}
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <AntTitle level={1} style={{ marginBottom: 8, fontSize: 36 }}>
          Waste Management Dashboard
        </AntTitle>
        <Text type="secondary" style={{ fontSize: 18 }}>
          Monitor and manage your waste efficiently
        </Text>
      </div>

      {/* Summary Cards Row */}
      <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              height: "100%",
            }}
          >
            <Space direction="vertical" size={4} style={{ width: "100%" }}>
              <BarChartOutlined style={{ fontSize: 32, color: "#1890ff" }} />
              <Text type="secondary">Total Waste</Text>
              <AntTitle level={3} style={{ margin: 0 }}>
                {totalAmount.toFixed(2)} kg
              </AntTitle>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              height: "100%",
              background: "#f6ffed",
            }}
          >
            <Space direction="vertical" size={4} style={{ width: "100%" }}>
              <SyncOutlined style={{ fontSize: 32, color: "#52c41a" }} />
              <Text type="secondary">Recyclable Waste</Text>
              <AntTitle level={3} style={{ margin: 0 }}>
                {recyclableAmount.toFixed(2)} kg
              </AntTitle>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              height: "100%",
              background: "#fff2f0",
            }}
          >
            <Space direction="vertical" size={4} style={{ width: "100%" }}>
              <DeleteOutlined style={{ fontSize: 32, color: "#ff4d4f" }} />
              <Text type="secondary">Non-Recyclable</Text>
              <AntTitle level={3} style={{ margin: 0 }}>
                {(totalAmount - recyclableAmount).toFixed(2)} kg
              </AntTitle>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              height: "100%",
              background: binFill > 80 ? "#fff2f0" : "#f6ffed",
            }}
          >
            <Space direction="vertical" size={4} style={{ width: "100%" }}>
              <BarChartOutlined
                style={{
                  fontSize: 32,
                  color: binFill > 80 ? "#ff4d4f" : "#52c41a",
                }}
              />
              <Text type="secondary">Bin Capacity</Text>
              <AntTitle level={3} style={{ margin: 0 }}>
                {binFill.toFixed(1)}%
              </AntTitle>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Main Content Grid */}
      <Row gutter={[24, 24]}>
        {/* Left Column */}
        <Col xs={24} lg={14}>
          {/* Waste Bin Card */}
          <Card
            title={
              <AntTitle level={4} style={{ margin: 0 }}>
                Waste Bin
              </AntTitle>
            }
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              marginBottom: 24,
            }}
          >
            {/* Animated Waste Bin */}
            <div
              className="relative w-32 h-48 border-4 border-gray-700 rounded-b-lg overflow-hidden bg-gray-300"
              style={{
                width: 128,
                height: 192,
                borderRadius: "0 0 16px 16px",
                border: "4px solid #444",
                background: "#e5e7eb",
                position: "relative",
                overflow: "hidden",
                margin: "0 auto",
              }}
            >
              {/* Waste Fill Animation */}
              <motion.div
                className="absolute bottom-0 w-full"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: `${binFill}%`,
                  background: fillColor,
                  transition: "height 1.5s ease-in-out",
                }}
              >
                {/* Wave Animation */}
                <motion.svg
                  className="absolute w-full -top-10"
                  style={{
                    position: "absolute",
                    width: "100%",
                    top: -40,
                    left: 0,
                  }}
                  viewBox="0 0 120 40"
                  preserveAspectRatio="none"
                >
                  <motion.path
                    fill={fillColor}
                    d="M0 20 Q 30 10 60 20 T 120 20 V 40 H 0 Z"
                    animate={{
                      d: [
                        "M0 20 Q 30 10 60 20 T 120 20 V 40 H 0 Z",
                        "M0 20 Q 30 15 60 10 T 120 20 V 40 H 0 Z",
                        "M0 20 Q 30 10 60 20 T 120 20 V 40 H 0 Z",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.svg>
              </motion.div>
            </div>
            <div
              style={{
                textAlign: "center",
                marginTop: 12,
                fontWeight: 600,
                fontSize: 18,
              }}
            >
              {binFill.toFixed(1)}% Full
            </div>
          </Card>

          {/* Analytics Card */}
          <Card
            title={
              <AntTitle level={4} style={{ margin: 0 }}>
                Analytics Overview
              </AntTitle>
            }
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              marginBottom: 24,
            }}
          >
            <div
              className="bg-gray-100 p-4 rounded"
              style={{ marginBottom: 24 }}
            >
              <p className="text-lg">Total Waste Amount: {totalAmount} kg</p>
              <p className="text-lg">
                Recyclable Waste Amount: {recyclableAmount} kg
              </p>
              <p className="text-lg">
                Non-Recyclable Waste Amount: {totalAmount - recyclableAmount} kg
              </p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <AntTitle level={5}>Distribution by Category</AntTitle>
              <div style={{ height: "250px", position: "relative" }}>
                <Bar
                  data={chartData}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div>
              <AntTitle level={5}>Category Breakdown</AntTitle>
              <div style={{ height: "250px", position: "relative" }}>
                <Pie
                  data={pieChartData}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "right",
                      },
                    },
                  }}
                />
              </div>
            </div>
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={10}>
          {/* Quick Actions Card */}
          <Card
            title={
              <AntTitle level={4} style={{ margin: 0 }}>
                Quick Actions
              </AntTitle>
            }
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              marginBottom: 24,
            }}
          >
            <AnimatedAddWaste
              binFill={binFill}
              onAdd={() => setShowForm(true)}
            />
          </Card>

          {/* Waste Details List */}
          <Card
            title={
              <AntTitle level={4} style={{ margin: 0 }}>
                Waste Details
              </AntTitle>
            }
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ maxHeight: 400, overflowY: "auto", paddingRight: 8 }}>
              <ul className="space-y-2">
                {wasteDetails.map((waste, index) => (
                  <li
                    key={index}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 8,
                      background: waste.isRecyclable ? "#f6ffed" : "#fff2f0",
                      marginBottom: 8,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong>{waste.name}</strong> - {waste.category} -{" "}
                      {waste.amount} {waste.unit} -{" "}
                      {waste.isRecyclable ? "Recyclable" : "Not Recyclable"}
                    </div>
                    <Space>
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(index)}
                        style={{ color: "#1890ff" }}
                      >
                        Edit
                      </Button>
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(index)}
                        style={{ color: "#ff4d4f" }}
                      >
                        Delete
                      </Button>
                    </Space>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Form Modal - Keep existing code */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Waste Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Unit
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                >
                  <option value="">Select a unit</option>
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    name="isRecyclable"
                    checked={formData.isRecyclable}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Is Recyclable
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 rounded"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="mt-2 w-full bg-gray-500 text-white py-2 rounded"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast Message - Keep existing code */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

interface AnimatedAddWasteProps {
  binFill: number;
  onAdd: () => void;
}

const AnimatedAddWaste: React.FC<AnimatedAddWasteProps> = ({
  binFill,
  onAdd,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isClicked, setIsClicked] = React.useState(false);

  const handleClick = () => {
    setIsClicked(true);
    onAdd();
    setTimeout(() => setIsClicked(false), 500);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "20px",
        padding: "16px 24px",
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Decorative Icons Bar */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          padding: "8px 16px",
          background: "#f8f8f8",
          borderRadius: "12px",
          transform: isHovered ? "translateX(10px)" : "translateX(0)",
          transition: "transform 0.3s ease",
        }}
      >
        <span style={{ fontSize: "20px", opacity: 0.7 }}>🥫</span>
        <span style={{ fontSize: "20px", opacity: 0.7 }}>📦</span>
        <span style={{ fontSize: "20px", opacity: 0.7 }}>📄</span>
        <span style={{ fontSize: "20px", opacity: 0.7 }}>🍶</span>
      </div>

      {/* Add Button with Animation */}
      <div style={{ position: "relative" }}>
        <Button
          type="primary"
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            height: "48px",
            paddingLeft: "24px",
            paddingRight: "24px",
            borderRadius: "24px",
            background: binFill > 80 ? "#ff4d4f" : "#52c41a",
            border: "none",
            boxShadow: isHovered
              ? `0 0 20px ${binFill > 80 ? "#ff4d4f50" : "#52c41a50"}`
              : "none",
            transform: isClicked ? "scale(0.95)" : "scale(1)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <PlusOutlined
              style={{
                fontSize: "18px",
                transform: isHovered ? "rotate(90deg)" : "rotate(0)",
                transition: "transform 0.3s ease",
              }}
            />
            <span style={{ fontSize: "16px" }}>Add Wastage</span>
          </div>
        </Button>

        {/* Animated Ripple Effect */}
        {isClicked && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              height: "100%",
              borderRadius: "24px",
              background: binFill > 80 ? "#ff4d4f" : "#52c41a",
              animation: "ripple 0.5s ease-out forwards",
            }}
          />
        )}
      </div>

      {/* Status Dot */}
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: binFill > 80 ? "#ff4d4f" : "#52c41a",
          boxShadow: `0 0 0 4px ${binFill > 80 ? "#ff4d4f20" : "#52c41a20"}`,
          animation: binFill > 80 ? "pulse 2s infinite" : "none",
        }}
      />

      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0.3);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.5;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default WasteManagement;
