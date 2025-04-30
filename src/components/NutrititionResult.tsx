import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Button } from "react-bootstrap";

// Define types for nutrition results
interface NutritionResults {
  success: boolean;
  adjustedCalories: string;
  macros: {
    protein: string;
    carbs: string;
    fats: string;
  };
  mealPlan: string;
  mealMacros: {
    breakfast: {
      protein: string;
      carbs: string;
      fats: string;
    };
    lunch: {
      protein: string;
      carbs: string;
      fats: string;
    };
    dinner: {
      protein: string;
      carbs: string;
      fats: string;
    };
  };
  error?: string;
}

// Define the structured meal plan type
interface StructuredMealPlan {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snacks: string[];
}

// Utility function to parse the mealPlan string into a structured object and clean up text
const parseMealPlan = (mealPlan: string): StructuredMealPlan => {
  const sections = mealPlan.split(/(Breakfast|Lunch|Dinner|Snacks)/);
  const structuredPlan: StructuredMealPlan = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  };

  let currentSection: keyof StructuredMealPlan | null = null;

  sections.forEach((section) => {
    section = section.trim();
    if (!section) return;

    if (["Breakfast", "Lunch", "Dinner", "Snacks"].includes(section)) {
      currentSection = section.toLowerCase() as keyof StructuredMealPlan;
    } else if (currentSection) {
      const items = section
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item && item.startsWith("-"))
        .map((item) =>
          item
            .replace(/^-/, "") // Remove the bullet point
            .replace(/[#*]+/, "") // Remove unnecessary symbols like # or *
            .trim()
        );
      structuredPlan[currentSection] = items;
    }
  });

  return structuredPlan;
};

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56"];

const NutritionResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  let results = location.state?.results as NutritionResults | undefined;

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-navy">No Results Found</h2>
          <p className="text-dark-gray mt-2">Please submit the form to generate a nutrition plan.</p>
          <Button
            onClick={() => navigate("/")}
            className="mt-4"
            style={{
              backgroundColor: "#1A2526",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Back to Form
          </Button>
        </div>
      </div>
    );
  }

  // Mock mealMacros data for testing (remove this once the backend provides the data)
  results = {
    ...results,
    mealMacros: {
      breakfast: {
        protein: "40",
        carbs: "60",
        fats: "20",
      },
      lunch: {
        protein: "50",
        carbs: "80",
        fats: "30",
      },
      dinner: {
        protein: "60",
        carbs: "70",
        fats: "25",
      },
    },
  };

  // Prepare data for the pie charts
  const breakfastPieData = [
    { name: "Protein", value: parseFloat(results.mealMacros.breakfast.protein) || 0 },
    { name: "Carbs", value: parseFloat(results.mealMacros.breakfast.carbs) || 0 },
    { name: "Fats", value: parseFloat(results.mealMacros.breakfast.fats) || 0 },
  ];

  const lunchPieData = [
    { name: "Protein", value: parseFloat(results.mealMacros.lunch.protein) || 0 },
    { name: "Carbs", value: parseFloat(results.mealMacros.lunch.carbs) || 0 },
    { name: "Fats", value: parseFloat(results.mealMacros.lunch.fats) || 0 },
  ];

  const dinnerPieData = [
    { name: "Protein", value: parseFloat(results.mealMacros.dinner.protein) || 0 },
    { name: "Carbs", value: parseFloat(results.mealMacros.dinner.carbs) || 0 },
    { name: "Fats", value: parseFloat(results.mealMacros.dinner.fats) || 0 },
  ];

  // Parse the mealPlan string into a structured object
  const structuredMealPlan = parseMealPlan(results.mealPlan);

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-navy">Your Personalized Nutrition Plan</h1>
          <p className="text-lg text-dark-gray mt-2">Tailored to your goals and preferences</p>
        </div>

        {/* Daily Intake Section */}
        <div className="card mb-10">
          <h3 className="card-header text-navy">Recommended Daily Intake</h3>
          <div className="text-center">
            <p className="text-lg font-semibold">
              <strong>Calories:</strong> {results.adjustedCalories} kcal
            </p>
          </div>
        </div>

        {/* Pie Charts Section */}
        <div className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Breakfast Pie Chart */}
            <div className="card">
              <h3 className="text-xl font-semibold text-navy mb-4">Breakfast Macronutrient Breakdown</h3>
              <PieChart width={300} height={300}>
                <Pie
                  dataKey="value"
                  data={breakfastPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}g`}
                >
                  {breakfastPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}g`} />
                <Legend />
              </PieChart>
            </div>

            {/* Lunch Pie Chart */}
            <div className="card">
              <h3 className="text-xl font-semibold text-navy mb-4">Lunch Macronutrient Breakdown</h3>
              <PieChart width={300} height={300}>
                <Pie
                  dataKey="value"
                  data={lunchPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}g`}
                >
                  {lunchPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}g`} />
                <Legend />
              </PieChart>
            </div>

            {/* Dinner Pie Chart */}
            <div className="card">
              <h3 className="text-xl font-semibold text-navy mb-4">Dinner Macronutrient Breakdown</h3>
              <PieChart width={300} height={300}>
                <Pie
                  dataKey="value"
                  data={dinnerPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}g`}
                >
                  {dinnerPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}g`} />
                <Legend />
              </PieChart>
            </div>
          </div>
        </div>

        {/* Meal Plan Section */}
        <div className="card">
          <h3 className="card-header text-navy">Personalized Meal Plan</h3>
          <div className="text-dark-gray">
            {structuredMealPlan.breakfast.length > 0 && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-navy mb-2">Breakfast</h4>
                <ul className="list-disc pl-5">
                  {structuredMealPlan.breakfast.map((item, index) => (
                    <li key={index} className="mb-1">{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {structuredMealPlan.lunch.length > 0 && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-navy mb-2">Lunch</h4>
                <ul className="list-disc pl-5">
                  {structuredMealPlan.lunch.map((item, index) => (
                    <li key={index} className="mb-1">{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {structuredMealPlan.dinner.length > 0 && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-navy mb-2">Dinner</h4>
                <ul className="list-disc pl-5">
                  {structuredMealPlan.dinner.map((item, index) => (
                    <li key={index} className="mb-1">{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {structuredMealPlan.snacks.length > 0 && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-navy mb-2">Snacks</h4>
                <ul className="list-disc pl-5">
                  {structuredMealPlan.snacks.map((item, index) => (
                    <li key={index} className="mb-1">{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-10">
          <Button
            onClick={() => navigate("/")}
            style={{
              backgroundColor: "#1A2526",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Back to Form
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NutritionResultsPage;