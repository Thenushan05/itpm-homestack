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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import "../finance-overview/finance-overview.sass";
import "../../../sass/custom/index.sass";
import axios from "axios";

const THEME_COLORS = {
  primary: "#4361ee",
  secondary: "#3f37c9",
  success: "#4cc9f0",
  warning: "#f72585",
  info: "#4895ef",
  light: "#f8f9fa",
  dark: "#212529",
  background: "#f5f7ff",
  cardBg: "#ffffff",
  border: "#e9ecef",
  text: "#495057",
  textLight: "#6c757d",
  shadow: "rgba(0, 0, 0, 0.05)",
};

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

  const [currentPage] = useState(1);
  const [, setTotalItems] = useState(0);
  const [, setError] = useState<string>("");
  const itemsPerPage = 10;
  const [home, setHome] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [, setMonthlyBudget] = useState<number>(0);
  const [showBudgetPopup, setShowBudgetPopup] = useState(false);
  const [budgets, setBudgets] = useState<
    Array<{ _id: string; budget: number }>
  >([]);

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

  const fetchBudgets = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/budget/details"
      );
      setBudgets(response.data);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    }
  };

  const handleSetBudget = () => {
    setShowBudgetPopup(true);
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetInput = (
      document.getElementById("budgetInput") as HTMLInputElement
    ).value;
    const budgetAmount = parseFloat(budgetInput);
    if (!isNaN(budgetAmount)) {
      setMonthlyBudget(budgetAmount);
      setShowBudgetPopup(false);

      // Save budget to the backend
      try {
        const response = await axios.post(
          "http://localhost:5000/api/budget/save",
          {
            username: "user", // Replace with actual username
            homeName: home, // Use the actual homeName from state
            userId: userId, // Use the actual userId from state
            budget: budgetAmount,
          }
        );
        console.log("Budget saved:", response.data);
      } catch (error) {
        console.error("Error saving budget:", error);
      }
    } else {
      alert("Please enter a valid number for the budget.");
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/budget/delete/${id}`);
      fetchBudgets();
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };

  const handleEditBudget = (id: string, currentBudget: number) => {
    setMonthlyBudget(currentBudget);
    setShowBudgetPopup(true);
    // Optionally, you can set a flag to indicate editing mode
  };

  const fetchIncome = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token not found.");
        return [];
      }

      const response = await axios.get(
        "http://localhost:5000/api/income/details",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data || [];
    } catch (error) {
      console.error("Error fetching income data:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchItems();
    fetchBudgets();
    fetchIncome();
  }, []);
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.budget, 0);
  const totalExpense = items.reduce((sum, item) => sum + item.amount, 0);
  const savings = totalBudget - totalExpense;
  const expensePercentage =
    totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0;
  const savingsPercentage = totalBudget > 0 ? (savings / totalBudget) * 100 : 0;

  // Generate monthly data based on actual expenses
  const generateMonthlyData = (
    expenseItems: Array<{ category: string; amount: number }>
  ) => {
    // Group expenses by month
    const expensesByMonth: Record<string, number> = {};
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Initialize with zero values for each month
    months.forEach((month) => {
      expensesByMonth[month] = 0;
    });

    // Sum expenses by month
    const currentMonth = new Date().getMonth();
    const recentMonths = months.slice(
      Math.max(0, currentMonth - 5),
      currentMonth + 1
    );

    // Distribute actual expenses across recent months for demo purposes
    const totalExp = expenseItems.reduce((sum, item) => sum + item.amount, 0);
    const avgExpense = totalExp / recentMonths.length;

    recentMonths.forEach((month, idx) => {
      // Create some variation in the distribution
      const factor = 0.7 + (idx / recentMonths.length) * 0.6;
      expensesByMonth[month] = avgExpense * factor;
    });

    // Convert to array format for charts
    return recentMonths.map((month) => ({
      month,
      expense: Math.round(expensesByMonth[month]),
      savings: Math.max(
        0,
        Math.round(totalBudget / recentMonths.length - expensesByMonth[month])
      ),
    }));
  };

  const monthlyData = generateMonthlyData(items);

  // Category data
  const categoryData = () => {
    const categories: Record<string, number> = {};

    // Group expenses by category
    items.forEach((item) => {
      if (!categories[item.category]) {
        categories[item.category] = 0;
      }
      categories[item.category] += item.amount;
    });

    // Convert to array format for charts
    return Object.keys(categories).map((category) => ({
      name: category,
      value: categories[category],
    }));
  };

  const pieData = categoryData();
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  return (
    <div
      className="finance-overview"
      style={{ padding: "32px 24px", background: THEME_COLORS.background }}
    >
      {/* Header Section */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            color: THEME_COLORS.dark,
            marginBottom: "0.5rem",
          }}
        >
          Financial Overview
        </h1>
        <p
          style={{
            color: THEME_COLORS.textLight,
            fontSize: "1.1rem",
          }}
        >
          Track your expenses, budget, and savings
        </p>
      </div>

      {/* Summary Cards Row */}
      <div
        className="summary-cards"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        {/* Budget Card */}
        <div
          className="summary-card"
          style={{
            background: THEME_COLORS.cardBg,
            borderRadius: "16px",
            padding: "24px",
            boxShadow: `0 4px 12px ${THEME_COLORS.shadow}`,
          }}
        >
          <h3 style={{ color: THEME_COLORS.text, marginBottom: "16px" }}>
            Total Budget
          </h3>
          <div
            style={{
              fontSize: "2rem",
              color: THEME_COLORS.primary,
              marginBottom: "8px",
            }}
          >
            ${totalBudget.toFixed(2)}
          </div>
          <button
            onClick={handleSetBudget}
            style={{
              background: THEME_COLORS.primary,
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Set Budget
          </button>
        </div>

        {/* Expenses Card */}
        <div
          className="summary-card"
          style={{
            background: THEME_COLORS.cardBg,
            borderRadius: "16px",
            padding: "24px",
            boxShadow: `0 4px 12px ${THEME_COLORS.shadow}`,
          }}
        >
          <h3 style={{ color: THEME_COLORS.text, marginBottom: "16px" }}>
            Total Expenses
          </h3>
          <div
            style={{
              fontSize: "2rem",
              color: THEME_COLORS.warning,
              marginBottom: "8px",
            }}
          >
            ${totalExpense.toFixed(2)}
          </div>
          <Progress
            percent={expensePercentage}
            status={expensePercentage > 90 ? "exception" : "active"}
            strokeColor={
              expensePercentage > 90
                ? THEME_COLORS.warning
                : THEME_COLORS.primary
            }
          />
        </div>

        {/* Savings Card */}
        <div
          className="summary-card"
          style={{
            background: THEME_COLORS.cardBg,
            borderRadius: "16px",
            padding: "24px",
            boxShadow: `0 4px 12px ${THEME_COLORS.shadow}`,
          }}
        >
          <h3 style={{ color: THEME_COLORS.text, marginBottom: "16px" }}>
            Total Savings
          </h3>
          <div
            style={{
              fontSize: "2rem",
              color: THEME_COLORS.success,
              marginBottom: "8px",
            }}
          >
            ${savings.toFixed(2)}
          </div>
          <Progress
            percent={savingsPercentage}
            status="active"
            strokeColor={THEME_COLORS.success}
          />
        </div>
      </div>

      {/* Charts Grid */}
      <div
        className="charts-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        {/* Expense vs Savings Chart */}
        <div
          className="chart-container"
          style={{
            background: THEME_COLORS.cardBg,
            borderRadius: "12px",
            padding: "24px",
            boxShadow: `0 8px 16px ${THEME_COLORS.shadow}`,
            minHeight: "500px",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: THEME_COLORS.dark,
              marginBottom: "16px",
            }}
          >
            Expense vs Savings Trends
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              barGap={8}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={THEME_COLORS.border}
              />
              <XAxis
                dataKey="month"
                axisLine={{ stroke: THEME_COLORS.border }}
                tick={{ fill: THEME_COLORS.text }}
              />
              <YAxis
                axisLine={{ stroke: THEME_COLORS.border }}
                tick={{ fill: THEME_COLORS.text }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                contentStyle={{
                  background: THEME_COLORS.cardBg,
                  border: `1px solid ${THEME_COLORS.border}`,
                  borderRadius: "4px",
                  boxShadow: `0 2px 8px ${THEME_COLORS.shadow}`,
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Bar
                dataKey="expense"
                name="Expenses"
                fill={THEME_COLORS.warning}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="savings"
                name="Savings"
                fill={THEME_COLORS.success}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trends Line Chart */}
        <div
          className="chart-container"
          style={{
            background: THEME_COLORS.cardBg,
            borderRadius: "12px",
            padding: "24px",
            boxShadow: `0 8px 16px ${THEME_COLORS.shadow}`,
            minHeight: "500px",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: THEME_COLORS.dark,
              marginBottom: "16px",
            }}
          >
            Monthly Expense Trend
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={THEME_COLORS.border}
              />
              <XAxis
                dataKey="month"
                axisLine={{ stroke: THEME_COLORS.border }}
                tick={{ fill: THEME_COLORS.text }}
              />
              <YAxis
                axisLine={{ stroke: THEME_COLORS.border }}
                tick={{ fill: THEME_COLORS.text }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                contentStyle={{
                  background: THEME_COLORS.cardBg,
                  border: `1px solid ${THEME_COLORS.border}`,
                  borderRadius: "4px",
                  boxShadow: `0 2px 8px ${THEME_COLORS.shadow}`,
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Line
                type="monotone"
                dataKey="expense"
                name="Expenses"
                stroke={THEME_COLORS.warning}
                strokeWidth={3}
                dot={{ r: 6, strokeWidth: 2, fill: "white" }}
                activeDot={{
                  r: 8,
                  stroke: THEME_COLORS.warning,
                  strokeWidth: 2,
                }}
              />
              <Line
                type="monotone"
                dataKey="savings"
                name="Savings"
                stroke={THEME_COLORS.success}
                strokeWidth={3}
                dot={{ r: 6, strokeWidth: 2, fill: "white" }}
                activeDot={{
                  r: 8,
                  stroke: THEME_COLORS.success,
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div
          className="chart-container"
          style={{
            background: THEME_COLORS.cardBg,
            borderRadius: "12px",
            padding: "24px",
            boxShadow: `0 8px 16px ${THEME_COLORS.shadow}`,
            minHeight: "500px",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: THEME_COLORS.dark,
              marginBottom: "16px",
            }}
          >
            Expense by Category
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                labelLine={false}
                outerRadius={150}
                innerRadius={60}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                contentStyle={{
                  background: THEME_COLORS.cardBg,
                  border: `1px solid ${THEME_COLORS.border}`,
                  borderRadius: "4px",
                  boxShadow: `0 2px 8px ${THEME_COLORS.shadow}`,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            {pieData.map((entry, index) => (
              <div
                key={`legend-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: `${COLORS[index % COLORS.length]}10`,
                  padding: "8px 12px",
                  borderRadius: "20px",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: COLORS[index % COLORS.length],
                    marginRight: "8px",
                  }}
                />
                <span style={{ color: THEME_COLORS.text }}>
                  {entry.name}: ${entry.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Summary */}
        <div
          className="analytics-summary"
          style={{
            background: THEME_COLORS.cardBg,
            borderRadius: "12px",
            padding: "24px",
            boxShadow: `0 8px 16px ${THEME_COLORS.shadow}`,
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: THEME_COLORS.dark,
              marginBottom: "16px",
            }}
          >
            Financial Insights
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div className="insight-item">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <h4
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: THEME_COLORS.dark,
                  }}
                >
                  Budget Utilization
                </h4>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color:
                      expensePercentage > 90
                        ? THEME_COLORS.warning
                        : THEME_COLORS.success,
                  }}
                >
                  {expensePercentage.toFixed(1)}%
                </span>
              </div>
              <div
                style={{
                  height: "8px",
                  background: `${THEME_COLORS.primary}15`,
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(expensePercentage, 100)}%`,
                    background:
                      expensePercentage > 90
                        ? THEME_COLORS.warning
                        : THEME_COLORS.success,
                    borderRadius: "4px",
                    transition: "width 1s ease-in-out",
                  }}
                />
              </div>
            </div>

            <div className="insight-item">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <h4
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: THEME_COLORS.dark,
                  }}
                >
                  Savings Rate
                </h4>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: THEME_COLORS.success,
                  }}
                >
                  {savingsPercentage.toFixed(1)}%
                </span>
              </div>
              <div
                style={{
                  height: "8px",
                  background: `${THEME_COLORS.success}15`,
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(savingsPercentage, 100)}%`,
                    background: THEME_COLORS.success,
                    borderRadius: "4px",
                    transition: "width 1s ease-in-out",
                  }}
                />
              </div>
            </div>

            <div className="insight-item">
              <h4
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: THEME_COLORS.dark,
                  marginBottom: "12px",
                }}
              >
                Top Spending Categories
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {pieData
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 3)
                  .map((item, index) => (
                    <div
                      key={`top-${index}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom:
                          index < 2
                            ? `1px solid ${THEME_COLORS.border}`
                            : "none",
                        paddingBottom: index < 2 ? "12px" : "0",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: COLORS[index % COLORS.length],
                            marginRight: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "12px",
                          }}
                        >
                          {index + 1}
                        </div>
                        <span style={{ color: THEME_COLORS.text }}>
                          {item.name}
                        </span>
                      </div>
                      <span
                        style={{ color: THEME_COLORS.dark, fontWeight: "600" }}
                      >
                        ${item.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Management Section */}
      <div
        className="budget-section"
        style={{
          background: THEME_COLORS.cardBg,
          borderRadius: "12px",
          padding: "24px",
          boxShadow: `0 8px 16px ${THEME_COLORS.shadow}`,
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: THEME_COLORS.dark,
            }}
          >
            Monthly Budgets
          </h2>
          <button
            onClick={handleSetBudget}
            style={{
              background: THEME_COLORS.primary,
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              width="16"
              height="16"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Set Monthly Budget
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "16px",
          }}
        >
          {budgets.map((budget) => (
            <div
              key={budget._id}
              style={{
                border: `1px solid ${THEME_COLORS.border}`,
                borderRadius: "8px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: THEME_COLORS.text, fontSize: "16px" }}>
                  Budget Amount
                </span>
                <span
                  style={{
                    color: THEME_COLORS.dark,
                    fontWeight: "700",
                    fontSize: "18px",
                  }}
                >
                  ${budget.budget.toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleEditBudget(budget._id, budget.budget)}
                  style={{
                    flex: "1",
                    background: `${THEME_COLORS.primary}15`,
                    color: THEME_COLORS.primary,
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteBudget(budget._id)}
                  style={{
                    flex: "1",
                    background: `${THEME_COLORS.warning}15`,
                    color: THEME_COLORS.warning,
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Setting Popup */}
      {showBudgetPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: THEME_COLORS.cardBg,
              padding: "32px",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "400px",
            }}
          >
            <h2 style={{ marginBottom: "24px", color: THEME_COLORS.text }}>
              Set Monthly Budget
            </h2>
            <form onSubmit={handleBudgetSubmit}>
              <input
                type="number"
                id="budgetInput"
                placeholder="Enter budget amount"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "16px",
                  borderRadius: "8px",
                  border: `1px solid ${THEME_COLORS.border}`,
                }}
              />
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="submit"
                  style={{
                    background: THEME_COLORS.primary,
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => setShowBudgetPopup(false)}
                  style={{
                    background: THEME_COLORS.textLight,
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinanceOverview;
