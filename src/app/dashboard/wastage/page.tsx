"use client";
import React, { use } from "react";
import "../wastage/waste.sass";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

const WasteManagement: React.FC = () => {
  const recyclingData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Recycling Rate",
        data: [40, 50, 55, 60, 65, 70],
        borderColor: "green",
        backgroundColor: "rgba(0, 128, 0, 0.2)",
        fill: true,
      },
    ],
  };

  const wasteCompositionData = {
    labels: ["Organic", "Plastic", "Metal", "Paper"],
    datasets: [
      {
        data: [40, 25, 15, 20],
        backgroundColor: ["#4CAF50", "#FF9800", "#607D8B", "#2196F3"],
      },
    ],
  };

  return (
    <div className="container">
      <h1 className="title">Waste Management Dashboard</h1>
      <div className="filter-buttons">
        <button className="active">Daily</button>
        <button className="weekly">Weekly</button>
        <button className="monthly">Monthly</button>
      </div>
      <div className="grid">
        <div className="card">
          <h2>Total Waste</h2>
          <p className="metric">100 kg</p>
          <p className="change positive">18% reduction from last week</p>
        </div>
        <div className="card">
          <h2>Recycling Rate</h2>
          <p className="metric">62%</p>
          <Line data={recyclingData} />
        </div>
        <div className="card">
          <h2>Waste Cost</h2>
          <p className="metric">$1,280</p>
          <p className="change negative">12% decrease from last week</p>
        </div>
      </div>
      <div className="grid">
        <div className="card">
          <h2>Waste Composition</h2>
          <Pie data={wasteCompositionData} />
        </div>
        <div className="card">
          <h2>Recycling Trend</h2>
          <Line data={recyclingData} />
        </div>
      </div>
    </div>
  );
};

export default WasteManagement;
