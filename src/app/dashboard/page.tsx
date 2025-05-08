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
  Bot,
  Brain,
  Sparkles,
  MessageSquare,
  Bell,
  Package,
  Award,
  ArrowRight,
  ArrowLeft,
  Leaf,
  Droplet,
  Zap,
  Users2,
  TrendingDown,
  Timer,
  Save,
  RefreshCw,
  CheckCircle,
  Target,
} from "lucide-react";
import axios from "axios";

interface BudgetItem {
  budget: number;
}

interface FinanceRecord {
  amount: number;
}

interface WasteItem {
  amount: number;
  isRecyclable: boolean;
}

const Dashboard = () => {
  // State for all data
  const [financeData, setFinanceData] = useState({
    totalBudget: 0,
    totalExpense: 0,
    savings: 0,
    expensePercentage: 0,
  });
  const [wasteData, setWasteData] = useState({
    totalWaste: 0,
    recyclableWaste: 0,
    nonRecyclableWaste: 0,
    binCapacity: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState({
    wasteTips: "",
    budgetInsights: "",
    sustainabilityScore: 0,
  });
  const [chatMessages, setChatMessages] = useState<
    Array<{
      text: string;
      sender: "user" | "bot";
      timestamp: Date;
    }>
  >([]);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "waste",
      message: "Bin collection tomorrow",
      priority: "high",
    },
    {
      id: 2,
      type: "budget",
      message: "Monthly budget review due",
      priority: "medium",
    },
    {
      id: 3,
      type: "task",
      message: "Home maintenance check pending",
      priority: "low",
    },
  ]);

  const [householdGoals, setHouseholdGoals] = useState([
    { id: 1, title: "Reduce waste by 20%", progress: 65, category: "waste" },
    { id: 2, title: "Save $500 this month", progress: 80, category: "finance" },
    {
      id: 3,
      title: "Zero plastic week",
      progress: 45,
      category: "sustainability",
    },
  ]);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Clean recycling bin",
      assigned: "John",
      due: "2024-03-20",
      status: "pending",
    },
    {
      id: 2,
      title: "Update budget sheet",
      assigned: "Sarah",
      due: "2024-03-21",
      status: "in-progress",
    },
    {
      id: 3,
      title: "Sort recyclables",
      assigned: "Mike",
      due: "2024-03-19",
      status: "completed",
    },
  ]);

  const [activeEcoTip, setActiveEcoTip] = useState(0);
  const [showInventoryModal, setShowInventoryModal] = useState(false);

  const [achievements, setAchievements] = useState([
    {
      id: 1,
      title: "Waste Warrior",
      description: "Reduced waste by 30%",
      icon: "🌱",
      unlocked: true,
    },
    {
      id: 2,
      title: "Budget Master",
      description: "Saved $1000",
      icon: "💰",
      unlocked: true,
    },
    {
      id: 3,
      title: "Green Champion",
      description: "Zero waste for a week",
      icon: "🏆",
      unlocked: false,
    },
  ]);

  const [inventory, setInventory] = useState([
    {
      id: 1,
      item: "Recycling Bags",
      quantity: 15,
      reorderPoint: 10,
      category: "waste",
    },
    {
      id: 2,
      item: "Eco-friendly Cleaners",
      quantity: 3,
      reorderPoint: 2,
      category: "cleaning",
    },
    {
      id: 3,
      item: "Compost Bins",
      quantity: 1,
      reorderPoint: 1,
      category: "waste",
    },
  ]);

  const ecoTips = [
    {
      id: 1,
      tip: "Use reusable bags for grocery shopping",
      icon: "🛍️",
      category: "shopping",
    },
    {
      id: 2,
      tip: "Start composting kitchen waste",
      icon: "🥬",
      category: "waste",
    },
    { id: 3, tip: "Switch to LED light bulbs", icon: "💡", category: "energy" },
    {
      id: 4,
      tip: "Collect rainwater for plants",
      icon: "🌧️",
      category: "water",
    },
  ];

  // Resource Usage Tracking
  const [resourceUsage, setResourceUsage] = useState({
    water: { current: 120, previous: 150, unit: "L", trend: "down" },
    electricity: { current: 250, previous: 280, unit: "kWh", trend: "down" },
    gas: { current: 45, previous: 40, unit: "m³", trend: "up" },
  });

  // Community Challenges
  const [communityStats, setCommunityStats] = useState({
    rank: 5,
    totalParticipants: 120,
    currentChallenge: "Zero Waste Week",
    progress: 85,
    leaderboard: [
      { name: "Green Family", score: 95 },
      { name: "Eco Warriors", score: 90 },
      { name: "Your Home", score: 85 },
    ],
  });

  // Smart Reminders
  const [reminders, setReminders] = useState([
    {
      id: 1,
      title: "Recycling Collection",
      date: "2024-03-21",
      priority: "high",
      recurring: "weekly",
    },
    {
      id: 2,
      title: "Energy Meter Reading",
      date: "2024-03-25",
      priority: "medium",
      recurring: "monthly",
    },
    {
      id: 3,
      title: "Water Bill Due",
      date: "2024-03-28",
      priority: "high",
      recurring: "monthly",
    },
  ]);

  // Predictive Analytics
  const [predictions, setPredictions] = useState({
    nextMonthWaste: { amount: 45, trend: "decreasing" },
    nextMonthBill: { amount: 180, trend: "stable" },
    sustainabilityScore: { current: 85, projected: 90 },
  });

  // Task Progress State
  const [taskProgress, setTaskProgress] = useState({
    daily: { completed: 3, total: 5 },
    weekly: { completed: 8, total: 12 },
    monthly: { completed: 15, total: 20 },
  });

  // Add activity history state
  const [activityHistory, setActivityHistory] = useState([
    {
      id: Date.now(),
      type: "task_complete",
      description: "Completed daily recycling task",
      timestamp: new Date(),
      category: "daily",
      impact: "positive",
    },
  ]);

  // Enhanced chat types and context
  interface ChatMessage {
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
    type?: "general" | "calculation" | "tip" | "reminder" | "greeting";
    context?: any;
  }

  // Chat context with typing status
  const [chatContext, setChatContext] = useState({
    lastQuery: "",
    isTyping: false,
    topic: null as string | null,
    conversationHistory: [] as string[],
    userPreferences: {
      notificationEnabled: true,
      preferredTopics: ["sustainability", "savings", "tasks"],
    },
  });

  // Chat patterns for natural conversation
  const chatPatterns = {
    greetings: [
      "hi",
      "hello",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
    ],
    farewells: ["bye", "goodbye", "see you", "talk to you later"],
    thanks: ["thank you", "thanks", "appreciate it", "great help"],
    positive: ["great", "awesome", "excellent", "perfect", "good"],
    negative: ["bad", "poor", "not good", "terrible", "wrong"],
    help: ["help", "assist", "guide", "explain", "show me"],
    status: ["how am i doing", "my progress", "status update", "performance"],
  };

  // Enhanced response generator
  const generateSmartResponse = (
    message: string,
    context: typeof chatContext
  ) => {
    const lowerMessage = message.toLowerCase();
    let response = "";
    let messageType: ChatMessage["type"] = "general";

    // Helper function to check message patterns
    const matchesPattern = (patterns: string[]) =>
      patterns.some((pattern) => lowerMessage.includes(pattern));

    // Context-aware greeting
    if (matchesPattern(chatPatterns.greetings)) {
      const hour = new Date().getHours();
      const timeBasedGreeting =
        hour < 12
          ? "Good morning"
          : hour < 17
          ? "Good afternoon"
          : "Good evening";
      response =
        `${timeBasedGreeting}! How can I help you manage your home today? I can assist with:\n` +
        "• Task management and progress tracking\n" +
        "• Sustainability calculations and tips\n" +
        "• Resource usage analysis\n" +
        "• Budget and savings planning";
      messageType = "greeting";
    }
    // Status and progress updates
    else if (matchesPattern(chatPatterns.status)) {
      const overallProgress = Math.round(
        ((taskProgress.daily.completed +
          taskProgress.weekly.completed +
          taskProgress.monthly.completed) /
          (taskProgress.daily.total +
            taskProgress.weekly.total +
            taskProgress.monthly.total)) *
          100
      );
      response =
        `Here's your current status:\n` +
        `• Overall Progress: ${overallProgress}%\n` +
        `• Daily Tasks: ${taskProgress.daily.completed}/${taskProgress.daily.total} completed\n` +
        `• Weekly Goals: ${taskProgress.weekly.completed}/${taskProgress.weekly.total} achieved\n` +
        `• Monthly Targets: ${taskProgress.monthly.completed}/${taskProgress.monthly.total} reached\n\n` +
        `Would you like more details about any specific area?`;
      messageType = "calculation";
    }
    // Help and guidance
    else if (matchesPattern(chatPatterns.help)) {
      response =
        "I'm here to help! I can assist you with:\n" +
        "1. 📊 Calculations & Analysis\n" +
        "   • Waste reduction estimates\n" +
        "   • Utility usage calculations\n" +
        "   • Sustainability scoring\n\n" +
        "2. 📋 Task Management\n" +
        "   • Progress tracking\n" +
        "   • Goal setting\n" +
        "   • Reminder setup\n\n" +
        "3. 💡 Smart Recommendations\n" +
        "   • Energy saving tips\n" +
        "   • Sustainability improvements\n" +
        "   • Resource optimization\n\n" +
        "What would you like to know more about?";
      messageType = "tip";
    }
    // Positive feedback
    else if (matchesPattern(chatPatterns.positive)) {
      response =
        "I'm glad I could help! Is there anything else you'd like to know about your home management?";
      messageType = "general";
    }
    // Negative feedback
    else if (matchesPattern(chatPatterns.negative)) {
      response =
        "I'm sorry to hear that. Could you tell me more about what's not working well? I'll do my best to help improve the situation.";
      messageType = "general";
    }
    // Task-related queries
    else if (lowerMessage.includes("task") || lowerMessage.includes("todo")) {
      const pendingTasks =
        taskProgress.daily.total - taskProgress.daily.completed;
      response =
        `You have ${pendingTasks} tasks remaining today. Would you like to:\n` +
        "• View task details\n" +
        "• Update task progress\n" +
        "• Set new tasks\n" +
        "• Get task recommendations";
      messageType = "reminder";
    }
    // Sustainability queries
    else if (lowerMessage.includes("sustain") || lowerMessage.includes("eco")) {
      const recyclablePercentage = (
        (wasteData.recyclableWaste / wasteData.totalWaste) *
        100
      ).toFixed(1);
      response =
        `Your sustainability overview:\n` +
        `• Recycling Rate: ${recyclablePercentage}%\n` +
        `• Energy Efficiency: ${
          resourceUsage.electricity.trend === "down"
            ? "Improving"
            : "Needs attention"
        }\n` +
        `• Water Usage: ${
          resourceUsage.water.trend === "down"
            ? "Optimized"
            : "Room for improvement"
        }\n\n` +
        `Would you like personalized sustainability tips?`;
      messageType = "calculation";
    }
    // Farewell
    else if (matchesPattern(chatPatterns.farewells)) {
      response =
        "Goodbye! Don't forget to check your task progress later. Have a great day!";
      messageType = "general";
    }
    // Default response with calculation capabilities
    else {
      return processCalculationResponse(message);
    }

    return { text: response, type: messageType };
  };

  // Enhanced chat handler with typing simulation
  const handleEnhancedChatSubmit = async (message: string) => {
    const newUserMessage: ChatMessage = {
      text: message,
      sender: "user",
      timestamp: new Date(),
      type: "general",
    };
    setChatMessages((prev) => [...prev, newUserMessage]);

    // Set typing status
    setChatContext((prev) => ({ ...prev, isTyping: true }));

    // Update conversation history
    setChatContext((prev) => ({
      ...prev,
      lastQuery: message,
      conversationHistory: [...prev.conversationHistory, message],
    }));

    // Simulate typing delay based on response length
    const simulateTyping = (response: string) => {
      const typingSpeed = 50; // ms per character
      const minDelay = 500; // minimum delay
      const delay = Math.max(
        minDelay,
        Math.min(response.length * typingSpeed, 2000)
      );
      return new Promise((resolve) => setTimeout(resolve, delay));
    };

    // Generate and send response
    const response = generateSmartResponse(message, chatContext);
    await simulateTyping(response.text);

    // Clear typing status and send response
    setChatContext((prev) => ({ ...prev, isTyping: false }));

    const botResponse: ChatMessage = {
      text: response.text,
      sender: "bot",
      timestamp: new Date(),
      type: response.type,
    };
    setChatMessages((prev) => [...prev, botResponse]);
  };

  // Replace existing chat submit with enhanced version
  const handleChatSubmit = handleEnhancedChatSubmit;

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
          (sum: number, budget: BudgetItem) => sum + budget.budget,
          0
        );
        const totalExpense =
          financeResponse.data.records?.reduce(
            (sum: number, item: FinanceRecord) => sum + item.amount,
            0
          ) || 0;

        setFinanceData({
          totalBudget,
          totalExpense,
          savings: totalBudget - totalExpense,
          expensePercentage:
            totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0,
        });

        // Process waste data
        const totalWaste = wasteResponse.data.reduce(
          (sum: number, item: WasteItem) => sum + item.amount,
          0
        );
        const recyclableWaste = wasteResponse.data
          .filter((item: WasteItem) => item.isRecyclable)
          .reduce((sum: number, item: WasteItem) => sum + item.amount, 0);

        setWasteData({
          totalWaste,
          recyclableWaste,
          nonRecyclableWaste: totalWaste - recyclableWaste,
          binCapacity: (totalWaste / 150) * 100, // Assuming 150kg is max capacity
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // AI Insights Generation
  const generateAIInsights = async () => {
    try {
      // This would be connected to your AI backend service
      const mockAIResponse = {
        wasteTips:
          "Based on your waste patterns, consider composting organic waste to reduce your non-recyclable waste by 30%.",
        budgetInsights: `You could save approximately $${(
          financeData.totalExpense * 0.15
        ).toFixed(2)} by optimizing your current spending patterns.`,
        sustainabilityScore: Math.floor(
          (wasteData.recyclableWaste / wasteData.totalWaste) * 100
        ),
      };
      setAiSuggestions(mockAIResponse);
    } catch (error) {
      console.error("Error generating AI insights:", error);
    }
  };

  useEffect(() => {
    if (wasteData.totalWaste > 0 || financeData.totalExpense > 0) {
      generateAIInsights();
    }
  }, [wasteData.totalWaste, financeData.totalExpense]);

  // Enhanced Progress Tracking
  const handleAdvancedProgressUpdate = (
    timeframe: "daily" | "weekly" | "monthly",
    details: {
      taskName?: string;
      category?: string;
      metrics?: {
        wasteReduction?: number;
        energyEfficiency?: number;
        waterConservation?: number;
        recyclingRate?: number;
      };
    }
  ) => {
    const { taskName, category, metrics } = details;

    // Update basic progress
    handleTaskProgressUpdate(timeframe, taskName);

    // Calculate sustainability score if metrics provided
    if (metrics) {
      const sustainabilityScore = homeCalculator.calculateSustainabilityScore(
        metrics as any
      );

      // Update predictions based on new data
      setPredictions((prev) => ({
        ...prev,
        sustainabilityScore: {
          current: sustainabilityScore,
          projected: Math.min(100, sustainabilityScore + 5),
        },
      }));

      // Add detailed activity record
      setActivityHistory((prev) => [
        {
          id: Date.now(),
          type: "metrics_update",
          description: `Updated ${timeframe} sustainability metrics`,
          timestamp: new Date(),
          category: category || timeframe,
          impact:
            sustainabilityScore > 80
              ? "positive"
              : sustainabilityScore > 60
              ? "neutral"
              : "negative",
          details: metrics,
        },
        ...prev.slice(0, 9),
      ]);

      // Update achievements if applicable
      if (sustainabilityScore > 85) {
        handleAchievementUpdate(3); // Unlock "Green Champion" achievement
      }
    }
  };

  // Connect advanced progress update to UI
  const handleProgressButtonClick = (
    timeframe: "daily" | "weekly" | "monthly"
  ) => {
    handleAdvancedProgressUpdate(timeframe, {
      metrics: {
        wasteReduction:
          (wasteData.recyclableWaste / wasteData.totalWaste) * 100,
        energyEfficiency:
          resourceUsage.electricity.current < resourceUsage.electricity.previous
            ? 85
            : 70,
        waterConservation:
          resourceUsage.water.current < resourceUsage.water.previous ? 85 : 70,
        recyclingRate: (wasteData.recyclableWaste / wasteData.totalWaste) * 100,
      },
    });
  };

  // Enhanced function to update task progress
  const handleTaskProgressUpdate = (
    timeframe: "daily" | "weekly" | "monthly",
    taskName?: string
  ) => {
    const defaultTasks = {
      daily: [
        "Recycling",
        "Energy check",
        "Water usage",
        "Waste sorting",
        "Budget review",
      ],
      weekly: [
        "Sustainability report",
        "Community challenge",
        "Resource audit",
        "Maintenance check",
      ],
      monthly: [
        "Monthly goals review",
        "Utility bills analysis",
        "Long-term planning",
      ],
    };

    const currentTask =
      taskName ||
      defaultTasks[timeframe][
        Math.floor(Math.random() * defaultTasks[timeframe].length)
      ];

    setTaskProgress((prev) => {
      const newCompleted = Math.min(
        prev[timeframe].completed + 1,
        prev[timeframe].total
      );
      const wasCompleted = newCompleted > prev[timeframe].completed;

      if (wasCompleted) {
        // Add to activity history
        setActivityHistory((current) => [
          {
            id: Date.now(),
            type: "task_complete",
            description: `Completed ${timeframe} task: ${currentTask}`,
            timestamp: new Date(),
            category: timeframe,
            impact: "positive",
          },
          ...current.slice(0, 9),
        ]); // Keep last 10 activities

        // Add notification for milestone achievements
        if (newCompleted === prev[timeframe].total) {
          setNotifications((current) => [
            {
              id: Date.now(),
              type: "achievement",
              message: `🎉 Completed all ${timeframe} tasks!`,
              priority: "high",
            },
            ...current,
          ]);
        } else if (newCompleted === Math.floor(prev[timeframe].total / 2)) {
          setNotifications((current) => [
            {
              id: Date.now(),
              type: "progress",
              message: `Halfway through ${timeframe} tasks!`,
              priority: "medium",
            },
            ...current,
          ]);
        }
      }

      return {
        ...prev,
        [timeframe]: {
          ...prev[timeframe],
          completed: newCompleted,
        },
      };
    });

    // Update community stats on task completion
    setCommunityStats((prev) => ({
      ...prev,
      progress: Math.min(100, prev.progress + 2),
    }));
  };

  const handleNextTip = () => {
    setActiveEcoTip((prev) => (prev + 1) % ecoTips.length);
  };

  const handlePrevTip = () => {
    setActiveEcoTip((prev) => (prev - 1 + ecoTips.length) % ecoTips.length);
  };

  // Function to handle inventory updates
  const handleInventoryUpdate = (id: number, change: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.quantity + change);
          // Check if we need to add a notification for low stock
          if (newQuantity <= item.reorderPoint) {
            setNotifications((current) => [
              {
                id: Date.now(),
                type: "inventory",
                message: `Low stock alert: ${item.item}`,
                priority: "high",
              },
              ...current,
            ]);
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // Function to handle resource usage updates
  const handleResourceUpdate = (
    type: "water" | "electricity" | "gas",
    value: number
  ) => {
    setResourceUsage((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        current: value,
        trend: value < prev[type].previous ? "down" : "up",
      },
    }));
  };

  // Function to handle community challenge participation
  const handleChallengeParticipation = (action: "join" | "update") => {
    if (action === "join") {
      setCommunityStats((prev) => ({
        ...prev,
        totalParticipants: prev.totalParticipants + 1,
      }));
    } else {
      setCommunityStats((prev) => ({
        ...prev,
        progress: Math.min(100, prev.progress + 5),
      }));
    }
  };

  // Function to update achievements
  const handleAchievementUpdate = (id: number) => {
    setAchievements((prev) =>
      prev.map((achievement) =>
        achievement.id === id ? { ...achievement, unlocked: true } : achievement
      )
    );
    // Add notification for new achievement
    setNotifications((current) => [
      {
        id: Date.now(),
        type: "achievement",
        message: `New achievement unlocked!`,
        priority: "medium",
      },
      ...current,
    ]);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-100 p-6 primary-bg"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header with Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 mb-4 md:mb-0"
          >
            Home Dashboard
          </motion.h1>
          <div className="flex space-x-4">
            {["overview", "finance", "waste"].map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
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
                      wasteData.binCapacity > 80 ? "bg-red-100" : "bg-green-100"
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

        {/* Weather and Smart Home Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Replace Weather Widget with Task Progress */}
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 rounded-xl text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Task Overview</h3>
                    <Activity className="h-8 w-8" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Daily Progress</span>
                        <span>
                          {(
                            (taskProgress.daily.completed /
                              taskProgress.daily.total) *
                            100
                          ).toFixed(0)}
                          %
                        </span>
                      </div>
                      <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white"
                          style={{
                            width: `${
                              (taskProgress.daily.completed /
                                taskProgress.daily.total) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Weekly Goals</span>
                        <span>
                          {(
                            (taskProgress.weekly.completed /
                              taskProgress.weekly.total) *
                            100
                          ).toFixed(0)}
                          %
                        </span>
                      </div>
                      <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white"
                          style={{
                            width: `${
                              (taskProgress.weekly.completed /
                                taskProgress.weekly.total) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleProgressButtonClick("daily")}
                    className="mt-4 w-full bg-white/20 hover:bg-white/30 text-white rounded-lg px-4 py-2 transition-colors"
                  >
                    Update Progress
                  </button>
                </div>

                {/* Smart Notifications Center */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold">Recent Notifications</h3>
                  </div>
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg text-sm ${
                          notification.priority === "high"
                            ? "bg-red-50 text-red-700"
                            : notification.priority === "medium"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {notification.message}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Task Completion Impact */}
                <div className="bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-xl text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-6 w-6" />
                    <h3 className="font-semibold">Completion Impact</h3>
                  </div>
                  <div className="mt-2">
                    <div className="text-3xl font-bold">
                      {Math.round(
                        ((taskProgress.daily.completed +
                          taskProgress.weekly.completed +
                          taskProgress.monthly.completed) /
                          (taskProgress.daily.total +
                            taskProgress.weekly.total +
                            taskProgress.monthly.total)) *
                          100
                      )}
                      %
                    </div>
                    <p className="text-sm mt-2">Overall task completion rate</p>
                    <div className="mt-4 text-sm">
                      <div className="flex justify-between mb-2">
                        <span>Tasks Completed Today</span>
                        <span>{taskProgress.daily.completed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Weekly Achievements</span>
                        <span>{taskProgress.weekly.completed}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Eco Tips Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-6 w-6 text-green-500" />
                Daily Eco Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative">
                <button
                  onClick={handlePrevTip}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div className="mx-12 bg-green-50 p-6 rounded-xl text-center">
                  <div className="text-4xl mb-4">
                    {ecoTips[activeEcoTip].icon}
                  </div>
                  <p className="text-lg text-gray-700">
                    {ecoTips[activeEcoTip].tip}
                  </p>
                  <div className="mt-4 flex justify-center gap-2">
                    {ecoTips.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 w-2 rounded-full ${
                          index === activeEcoTip
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleNextTip}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg"
                >
                  <ArrowRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-yellow-500" />
                Household Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-xl border-2 ${
                      achievement.unlocked
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-gray-200 bg-gray-50 opacity-60"
                    }`}
                  >
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <p className="text-sm text-gray-600">
                      {achievement.description}
                    </p>
                    {!achievement.unlocked && (
                      <div className="mt-2 text-xs text-gray-500">
                        🔒 Locked
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Household Inventory */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-6 w-6 text-blue-500" />
                Household Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
                  >
                    <div>
                      <h4 className="font-medium">{item.item}</h4>
                      <p className="text-sm text-gray-500">
                        Category: {item.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Quantity</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleInventoryUpdate(item.id, -1)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleInventoryUpdate(item.id, 1)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      {item.quantity <= item.reorderPoint && (
                        <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                          Low Stock
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-purple-500" />
                AI Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Waste Management Tips */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Recycle className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold">Waste Management Tips</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {aiSuggestions.wasteTips}
                  </p>
                </div>

                {/* Budget Insights */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Smart Budget Insights</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {aiSuggestions.budgetInsights}
                  </p>
                </div>

                {/* Sustainability Score */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold">Sustainability Score</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-purple-500">
                      {aiSuggestions.sustainabilityScore}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Your household is performing well in sustainability
                      metrics!
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Assistant Chat Button */}
        <motion.div
          className="fixed bottom-6 right-6"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setShowAIChat(!showAIChat)}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 rounded-full p-4"
          >
            <Bot className="h-6 w-6" />
            <span>{showAIChat ? "Close Assistant" : "AI Assistant"}</span>
          </Button>
        </motion.div>

        {/* AI Chat Interface */}
        <AnimatePresence>
          {showAIChat && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-24 right-6 w-96 bg-white rounded-lg shadow-xl"
            >
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-purple-500" />
                    Smart Home Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-96 flex flex-col">
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                      {chatMessages.map((msg, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${
                            msg.sender === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              msg.sender === "user"
                                ? "bg-purple-500 text-white"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-line">
                              {msg.text}
                            </p>
                            <p className="text-xs mt-1 opacity-70">
                              {msg.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      {chatContext.isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-start"
                        >
                          <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                            <div className="flex space-x-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    <div className="border-t pt-4">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const input = e.currentTarget.elements.namedItem(
                            "message"
                          ) as HTMLInputElement;
                          if (input.value.trim()) {
                            handleChatSubmit(input.value);
                            input.value = "";
                          }
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          name="message"
                          placeholder="Ask about your home management..."
                          className="flex-1 p-2 border rounded-lg"
                        />
                        <Button
                          type="submit"
                          className="bg-purple-500 hover:bg-purple-600"
                        >
                          <MessageSquare className="h-5 w-5" />
                        </Button>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <AnimatePresence>
                  {activityHistory.map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`flex items-center gap-4 p-4 rounded-lg border-l-4 ${
                        activity.impact === "positive"
                          ? "bg-green-50 border-l-green-500"
                          : activity.impact === "neutral"
                          ? "bg-blue-50 border-l-blue-500"
                          : "bg-yellow-50 border-l-yellow-500"
                      }`}
                    >
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          activity.category === "daily"
                            ? "bg-blue-100"
                            : activity.category === "weekly"
                            ? "bg-purple-100"
                            : "bg-green-100"
                        }`}
                      >
                        {activity.type === "task_complete" ? (
                          <CheckCircle
                            className={`h-5 w-5 ${
                              activity.category === "daily"
                                ? "text-blue-500"
                                : activity.category === "weekly"
                                ? "text-purple-500"
                                : "text-green-500"
                            }`}
                          />
                        ) : (
                          <Target
                            className={`h-5 w-5 ${
                              activity.category === "daily"
                                ? "text-blue-500"
                                : activity.category === "weekly"
                                ? "text-purple-500"
                                : "text-green-500"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {activity.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.timestamp).toLocaleTimeString()} -{" "}
                          {activity.category.charAt(0).toUpperCase() +
                            activity.category.slice(1)}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.round(
                          (Date.now() -
                            new Date(activity.timestamp).getTime()) /
                            60000
                        )}{" "}
                        min ago
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resource Usage Monitoring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-blue-500" />
                Resource Usage Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Water Usage */}
                <div className="bg-blue-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <Droplet className="h-8 w-8 text-blue-500" />
                    <span
                      className={`text-sm ${
                        resourceUsage.water.trend === "down"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {resourceUsage.water.trend === "down"
                        ? "↓ -20%"
                        : "↑ +12%"}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold">
                    {resourceUsage.water.current}L
                  </h3>
                  <p className="text-sm text-gray-600">Water Usage</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Previous: {resourceUsage.water.previous}L
                  </div>
                </div>

                {/* Electricity Usage */}
                <div className="bg-yellow-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <Zap className="h-8 w-8 text-yellow-500" />
                    <span
                      className={`text-sm ${
                        resourceUsage.electricity.trend === "down"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {resourceUsage.electricity.trend === "down"
                        ? "↓ -11%"
                        : "↑ +8%"}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold">
                    {resourceUsage.electricity.current}kWh
                  </h3>
                  <p className="text-sm text-gray-600">Electricity Usage</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Previous: {resourceUsage.electricity.previous}kWh
                  </div>
                </div>

                {/* Gas Usage */}
                <div className="bg-purple-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="h-8 w-8 text-purple-500" />
                    <span
                      className={`text-sm ${
                        resourceUsage.gas.trend === "down"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {resourceUsage.gas.trend === "down" ? "↓ -8%" : "↑ +12%"}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold">
                    {resourceUsage.gas.current}m³
                  </h3>
                  <p className="text-sm text-gray-600">Gas Usage</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Previous: {resourceUsage.gas.previous}m³
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Community Challenges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users2 className="h-6 w-6 text-green-500" />
                Community Challenge Hub
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">
                      {communityStats.currentChallenge}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Community Rank: #{communityStats.rank} of{" "}
                      {communityStats.totalParticipants}
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-green-500">
                    {communityStats.progress}%
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <motion.div
                    className="bg-green-500 h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${communityStats.progress}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
              <div className="space-y-4">
                {communityStats.leaderboard.map((leader, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      leader.name === "Your Home"
                        ? "bg-green-50 border border-green-200"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-500">
                        #{index + 1}
                      </span>
                      <span>{leader.name}</span>
                    </div>
                    <div className="font-semibold">{leader.score} pts</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Smart Reminders & Predictions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Smart Reminders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-6 w-6 text-orange-500" />
                  Smart Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        reminder.priority === "high"
                          ? "border-l-red-500 bg-red-50"
                          : "border-l-yellow-500 bg-yellow-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{reminder.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Due: {reminder.date}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleReminderAction(reminder.id, "complete")
                            }
                            className="p-2 hover:bg-green-100 rounded-full transition-colors"
                          >
                            <Save className="h-4 w-4 text-green-500" />
                          </button>
                          <button
                            onClick={() =>
                              handleReminderAction(reminder.id, "snooze")
                            }
                            className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                          >
                            <RefreshCw className="h-4 w-4 text-blue-500" />
                          </button>
                          <button
                            onClick={() =>
                              handleReminderAction(reminder.id, "delete")
                            }
                            className="p-2 hover:bg-red-100 rounded-full transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Predictive Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-6 w-6 text-purple-500" />
                  Predictive Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">
                        Next Month's Waste Prediction
                      </h4>
                      <span
                        className={`text-sm ${
                          predictions.nextMonthWaste.trend === "decreasing"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {predictions.nextMonthWaste.trend === "decreasing"
                          ? "↓ Decreasing"
                          : "↑ Increasing"}
                      </span>
                    </div>
                    <p className="text-2xl font-bold">
                      {predictions.nextMonthWaste.amount}kg
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Projected Utility Bill</h4>
                      <span
                        className={`text-sm ${
                          predictions.nextMonthBill.trend === "stable"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {predictions.nextMonthBill.trend === "stable"
                          ? "→ Stable"
                          : "↑ Increasing"}
                      </span>
                    </div>
                    <p className="text-2xl font-bold">
                      ${predictions.nextMonthBill.amount}
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">
                        Sustainability Score Projection
                      </h4>
                      <span className="text-sm text-green-500">
                        ↑ Improving
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Current</p>
                        <p className="text-xl font-bold">
                          {predictions.sustainabilityScore.current}
                        </p>
                      </div>
                      <div className="text-gray-400">→</div>
                      <div>
                        <p className="text-sm text-gray-600">Projected</p>
                        <p className="text-xl font-bold text-green-600">
                          {predictions.sustainabilityScore.projected}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
