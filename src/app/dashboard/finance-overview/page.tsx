"use client";
import React, { useEffect, useState } from "react";
import { Progress } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "../finance-overview/finance-overview.sass";
import "../../../sass/custom/index.sass";
import axios from "axios";

const data = [
  { month: "Jan", expense: 400 },
  { month: "Feb", expense: 300 },
  { month: "Mar", expense: 500 },
  { month: "Apr", expense: 700 },
  { month: "May", expense: 600 },
  { month: "Jun", expense: 800 },
];

const databar = [
  { category: "Food", expense: 70, color: "#6A5ACD" }, // Purple
  { category: "Grocery", expense: 50, color: "#32CD32" }, // Green
  { category: "Inventory", expense: 60, color: "#FFD700" }, // Yellow
  { category: "Utilities", expense: 80, color: "#FF69B4" }, // Pink
  { category: "Others", expense: 30, color: "#DC143C" }, // Red
];

function FinanceOverview() {
  const [items, setItems] = useState<
    {
      _id: string;
      userId: string;
      amount: number;
      category: string;
    }[]
  >([]);

  const [itemsByfilter, setItemsByfilter] = useState<
    {
      _id: string;
      userId: string;
    }[]
  >([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<string>("");
  const itemsPerPage = 10;
  const [home, setHome] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

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

      const homeResponse = await axios.get(
        `http://localhost:5000/api/user/${userIdFromToken}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setHome(homeResponse.data.homeName || "");
      setUserId(userIdFromToken); // Set state for userId

      if (!homeResponse.data.homeName) {
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/finance/${homeResponse.data.homeName}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { currentPage: currentPage, pageSize: itemsPerPage },
        }
      );

      if (!response.data.records) {
        setItems([]);
      } else {
        setItems(response.data.records);
        setTotalItems(response.data.totalItems);
      }

      const filterResponse = await axios.get(
        `http://localhost:5000/api/finance/${homeResponse.data.homeName}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { year: 2024, month: 4 },
        }
      );

      if (!filterResponse.data.purchases) {
        setItemsByfilter([]);
      } else {
        setItemsByfilter(filterResponse.data.purchases);
      }
    } catch (err) {
      setError("Failed to fetch items.");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  return (
    <div className="finance-overview-main primary-bg">
      <div className="cart-container ">
        <div className="budject-cart  primary-bg primary-border">
          <div className="cart-head primary-txt">
            <span>Monthly Budget</span>
          </div>
          <div className="progress-bar">
            <Progress
              type="dashboard"
              steps={8}
              percent={50}
              trailColor="rgba(222, 209, 209, 0.92)"
              size={20}
            />
          </div>
        </div>

        <div className="budject-cart  primary-bg primary-border">
          <div className="cart-head primary-txt">
            <span>Monthly Expenses</span>

            <div>
              <span>{totalAmount}</span>
            </div>
          </div>
          <div className="progress-bar">
            <Progress
              type="dashboard"
              steps={8}
              percent={65}
              trailColor="rgba(222, 209, 209, 0.92)"
              strokeWidth={20}
            />
          </div>
        </div>

        <div className="budject-cart  primary-bg primary-border">
          <div className="cart-head primary-txt">
            <span>Remaining Budget</span>
            <span></span>
          </div>
          <div className="progress-bar">
            <Progress
              type="dashboard"
              steps={8}
              percent={30}
              trailColor="rgba(222, 209, 209, 0.92)"
              strokeWidth={20}
            />
          </div>
        </div>

        <div className="budject-cart  primary-bg primary-border">
          <div className="cart-head primary-txt">
            <span>Savings</span>
          </div>
          <div className="progress-bar">
            <Progress
              type="dashboard"
              steps={8}
              percent={80}
              trailColor="rgba(222, 209, 209, 0.92)"
              strokeWidth={20}
            />
          </div>
        </div>
      </div>
      <div className="graphs-container">
        <div className="bar-chart-container  primary-bg primary-border primary-txt">
          <h3>Monthly Expense Overview</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="expense" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="horizontal-progress-container  primary-bg primary-border">
          {items.map((item) => (
            <div key={item.category} className="horizontal-progress">
              <div className="catogory">
                <span className="category-label primary-txt">
                  {item.category}
                </span>
                ?
              </div>

              <Progress
                percent={item.amount}
                showInfo={false}
                strokeWidth={6}
                strokeColor={
                  databar.find((d) => d.category === item.category)?.color ||
                  "#000"
                }
                trailColor="rgba(0, 0, 0, 0.06)"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FinanceOverview;
