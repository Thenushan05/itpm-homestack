"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bar, Pie } from "react-chartjs-2"; // Import Bar and Pie from react-chartjs-2
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"; // Import necessary Chart.js components

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
    <div className="container flex flex-col items-center mt-10">
      <h1 className="text-2xl font-bold mb-4">Waste Management Dashboard</h1>

      {/* Waste Bin Container */}
      <div className="relative w-32 h-48 border-4 border-gray-700 rounded-b-lg overflow-hidden bg-gray-300">
        {/* Waste Fill Animation */}
        <motion.div
          className="absolute bottom-0 w-full"
          style={{
            height: `${binFill}%`, // Adjust water height dynamically
            background: fillColor, // Color based on waste level
            transition: "height 1.5s ease-in-out",
          }}
        >
          {/* Wave Animation */}
          <motion.svg
            className="absolute w-full -top-10"
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

      {/* Display Total Waste Amount */}
      <p className="mt-2 text-lg font-semibold">
        Total Waste Amount: {totalAmount} kg ({binFill.toFixed(2)}%)
      </p>
      {totalAmount > 100 && (
        <p className="mt-2 text-red-500 font-semibold">
          Warning: Please dispose of the wastage as it exceeds 100 kg.
        </p>
      )}

      {/* Button to Toggle Form Visibility */}
      <button
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
        onClick={() => setShowForm(!showForm)}
      >
        Add Wastage
      </button>

      {/* Waste Form Popup */}
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

      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded shadow-lg">
          {toastMessage}
        </div>
      )}

      {/* Display Waste Details */}
      <div className="mt-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Waste Details</h2>
        <ul className="space-y-2">
          {wasteDetails.map((waste, index) => (
            <li
              key={index}
              className="border p-2 rounded flex justify-between items-center"
            >
              <div>
                <strong>{waste.name}</strong> - {waste.category} -{" "}
                {waste.amount} {waste.unit} -{" "}
                {waste.isRecyclable ? "Recyclable" : "Not Recyclable"}
              </div>
              <div>
                <button
                  onClick={() => handleEdit(index)}
                  className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Analytics Section */}
      <div className="mt-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Analytics</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p className="text-lg">Total Waste Amount: {totalAmount} kg</p>
          <p className="text-lg">
            Recyclable Waste Amount: {recyclableAmount} kg
          </p>
          <p className="text-lg">
            Non-Recyclable Waste Amount: {totalAmount - recyclableAmount} kg
          </p>
        </div>
      </div>

      {/* Graph Section */}
      <div className="mt-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Waste Distribution</h2>
        <Bar data={chartData} />
      </div>

      {/* Pie Chart Section */}
      <div className="mt-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Waste Category Distribution</h2>
        <Pie data={pieChartData} />
      </div>
    </div>
  );
};

export default WasteManagement;
