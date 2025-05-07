"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/card";
import {
  BarChart,
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Trash2,
  Recycle,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";

const Dashboard = () => {
  // State for all data
  const [financeData, setFinanceData] = useState({
    totalBudget: 0,
    totalExpense: 0,
    savings: 0,
    expensePercentage: 0,
    monthlyTrend: [] as { month: string; amount: number }[],
  });
  const [wasteData, setWasteData] = useState({
    totalWaste: 0,
    recyclableWaste: 0,
    nonRecyclableWaste: 0,
    binCapacity: 0,
    wasteHistory: [] as { date: string; amount: number; type: string }[],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [weatherData, setWeatherData] = useState({
    temperature: 0,
    condition: "",
    energyImpact: 0,
  });
  const [notifications, setNotifications] = useState<
    {
      id: number;
      type: string;
      message: string;
      timestamp: Date;
      priority: "low" | "medium" | "high";
    }[]
  >([]);
  const [showWelcome, setShowWelcome] = useState(true);

  // Welcome animation sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Get user details
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const userIdFromToken = decodedToken.id;

        // Get home details
        const homeResponse = await axios.get(
          `http://localhost:5000/api/user/${userIdFromToken}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const homeName = homeResponse.data.homeName;

        // Fetch finance data
        const financeResponse = await axios.get(
          `http://localhost:5000/api/finance/${homeName}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const budgetResponse = await axios.get(
          "http://localhost:5000/api/budget/details"
        );

        // Fetch waste data
        const wasteResponse = await axios.get(
          `http://localhost:5000/api/waste/details`
        );

        // Process finance data
        const totalBudget = budgetResponse.data.reduce(
          (sum: number, budget: { budget: number }) => sum + budget.budget,
          0
        );
        const totalExpense =
          financeResponse.data.records?.reduce(
            (sum: number, item: { amount: number }) => sum + item.amount,
            0
          ) || 0;

        // Generate sample monthly trend data (replace with actual data)
        const monthlyTrend = generateMonthlyTrend();

        setFinanceData({
          totalBudget,
          totalExpense,
          savings: totalBudget - totalExpense,
          expensePercentage:
            totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0,
          monthlyTrend,
        });

        // Process waste data
        const totalWaste = wasteResponse.data.reduce(
          (sum: number, item: { amount: number }) => sum + item.amount,
          0
        );
        const recyclableWaste = wasteResponse.data
          .filter((item: { isRecyclable: boolean }) => item.isRecyclable)
          .reduce(
            (sum: number, item: { amount: number }) => sum + item.amount,
            0
          );

        // Generate sample waste history (replace with actual data)
        const wasteHistory = generateWasteHistory();

        setWasteData({
          totalWaste,
          recyclableWaste,
          nonRecyclableWaste: totalWaste - recyclableWaste,
          binCapacity: (totalWaste / 150) * 100,
          wasteHistory,
        });

        // Simulate weather data fetch (replace with actual API call)
        const weatherData = await simulateWeatherData();
        setWeatherData(weatherData);

        // Generate sample notifications
        generateNotifications();

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Helper functions for generating sample data
  const generateMonthlyTrend = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month) => ({
      month,
      amount: Math.floor(Math.random() * 5000) + 1000,
    }));
  };

  const generateWasteHistory = () => {
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    });

    return dates.map((date) => ({
      date,
      amount: Math.floor(Math.random() * 10) + 1,
      type: Math.random() > 0.5 ? "recyclable" : "non-recyclable",
    }));
  };

  const simulateWeatherData = async () => {
    // Replace with actual weather API call
    return {
      temperature: Math.floor(Math.random() * 15) + 15,
      condition: ["Sunny", "Cloudy", "Rainy"][Math.floor(Math.random() * 3)],
      energyImpact: Math.floor(Math.random() * 30) + 70,
    };
  };

  const generateNotifications = () => {
    const sampleNotifications = [
      {
        id: 1,
        type: "finance",
        message: "Monthly budget limit approaching",
        timestamp: new Date(),
        priority: "high" as const,
      },
      {
        id: 2,
        type: "waste",
        message: "Bin capacity at 80%",
        timestamp: new Date(),
        priority: "medium" as const,
      },
      {
        id: 3,
        type: "energy",
        message: "Optimal temperature for energy savings: 22°C",
        timestamp: new Date(),
        priority: "low" as const,
      },
    ];
    setNotifications(sampleNotifications);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <>
      {/* Welcome Animation */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-blue-600 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 1.5 }}
              className="text-white text-4xl font-bold"
            >
              Welcome to Your Smart Home
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header with Tabs */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
                Home Dashboard
              </h1>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <div className="text-2xl">
                  {weatherData.condition === "Sunny"
                    ? "☀️"
                    : weatherData.condition === "Cloudy"
                    ? "☁️"
                    : "🌧️"}
                </div>
                <div className="text-gray-600">{weatherData.temperature}°C</div>
              </div>
            </motion.div>

            <div className="flex space-x-4">
              {["overview", "finance", "waste"].map((tab) => (
                <motion.button
                  key={tab}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-6"
          >
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                variants={cardVariants}
                className={`mb-2 p-4 rounded-lg shadow-sm ${
                  notification.priority === "high"
                    ? "bg-red-50 border-l-4 border-red-500"
                    : notification.priority === "medium"
                    ? "bg-yellow-50 border-l-4 border-yellow-500"
                    : "bg-blue-50 border-l-4 border-blue-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl`}>
                      {notification.type === "finance"
                        ? "💰"
                        : notification.type === "waste"
                        ? "🗑️"
                        : "⚡"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-500">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-500">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
          >
            {/* Finance Stats */}
            <motion.div variants={cardVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Total Budget
                      </p>
                      <h3 className="text-2xl font-bold mt-1">
                        ${financeData.totalBudget.toLocaleString()}
                      </h3>
                      <p className="text-sm text-green-500 flex items-center mt-1">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Budget Utilization:{" "}
                        {financeData.expensePercentage.toFixed(1)}%
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="bg-blue-100 p-3 rounded-full"
                    >
                      <DollarSign className="h-6 w-6 text-blue-500" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Waste Management Stats */}
            <motion.div variants={cardVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Total Waste
                      </p>
                      <h3 className="text-2xl font-bold mt-1">
                        {wasteData.totalWaste.toFixed(1)} kg
                      </h3>
                      <p className="text-sm text-green-500 flex items-center mt-1">
                        <Recycle className="w-4 h-4 mr-1" />
                        Recyclable:{" "}
                        {(
                          (wasteData.recyclableWaste / wasteData.totalWaste) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="bg-green-100 p-3 rounded-full"
                    >
                      <Trash2 className="h-6 w-6 text-green-500" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Bin Capacity */}
            <motion.div variants={cardVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Bin Capacity
                      </p>
                      <h3 className="text-2xl font-bold mt-1">
                        {wasteData.binCapacity.toFixed(1)}%
                      </h3>
                      <p
                        className={`text-sm flex items-center mt-1 ${
                          wasteData.binCapacity > 80
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {wasteData.binCapacity > 80
                          ? "Near capacity"
                          : "Good status"}
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`p-3 rounded-full ${
                        wasteData.binCapacity > 80
                          ? "bg-red-100"
                          : "bg-green-100"
                      }`}
                    >
                      <Activity
                        className={`h-6 w-6 ${
                          wasteData.binCapacity > 80
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Savings */}
            <motion.div variants={cardVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Total Savings
                      </p>
                      <h3 className="text-2xl font-bold mt-1">
                        ${financeData.savings.toLocaleString()}
                      </h3>
                      <p className="text-sm text-green-500 flex items-center mt-1">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {(
                          (financeData.savings / financeData.totalBudget) *
                          100
                        ).toFixed(1)}
                        % of budget
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="bg-purple-100 p-3 rounded-full"
                    >
                      <PieChart className="h-6 w-6 text-purple-500" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center h-64"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            <Button
              onClick={() => setActiveTab("finance")}
              className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600"
            >
              <DollarSign className="w-4 h-4" />
              Add Expense
            </Button>
            <Button
              onClick={() => setActiveTab("waste")}
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600"
            >
              <Trash2 className="w-4 h-4" />
              Log Waste
            </Button>
            <Button className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600">
              <Users className="w-4 h-4" />
              Manage Users
            </Button>
            <Button className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600">
              <BarChart className="w-4 h-4" />
              View Reports
            </Button>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {[1, 2, 3, 4, 5].map((item) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: item * 0.1 }}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">New activity recorded</p>
                          <p className="text-sm text-gray-500">
                            Activity #{item}23 was completed
                          </p>
                        </div>
                        <div className="ml-auto text-sm text-gray-500">
                          {item} hour{item !== 1 ? "s" : ""} ago
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* New: Energy Efficiency Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Energy Efficiency</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">⚡</div>
                    <div>
                      <p className="text-lg font-medium">
                        Current Efficiency Score
                      </p>
                      <p className="text-3xl font-bold text-green-500">
                        {weatherData.energyImpact}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Optimal Temperature</p>
                    <p className="text-xl font-medium">22°C</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${weatherData.energyImpact}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-green-500"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default Dashboard;
