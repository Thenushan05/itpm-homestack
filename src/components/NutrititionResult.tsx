"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Button } from "react-bootstrap";
import { useSearchParams, useRouter } from "next/navigation";

// Types
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

interface StructuredMealPlan {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snacks: string[];
}

// Parse meal plan into structured format
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
        .map((item) => item.replace(/^-/, "").replace(/[#*]+/, "").trim());
      structuredPlan[currentSection] = items;
    }
  });

  return structuredPlan;
};

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56"];

const NutritionResultsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<NutritionResults | null>(null);

  useEffect(() => {
    const resultParam = searchParams.get("results");
    if (resultParam) {
      try {
        const parsedResults = JSON.parse(resultParam);
        setResults(parsedResults);
      } catch (err) {
        console.error("Invalid results data");
        setResults(null);
      }
    }
  }, [searchParams]);

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-navy">No Results Found</h2>
          <p className="text-dark-gray mt-2">
            Please submit the form to generate a nutrition plan.
          </p>
          <Button
            onClick={() => router.push("/")}
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

  const breakfastPieData = [
    {
      name: "Protein",
      value: parseFloat(results.mealMacros.breakfast.protein) || 0,
    },
    {
      name: "Carbs",
      value: parseFloat(results.mealMacros.breakfast.carbs) || 0,
    },
    {
      name: "Fats",
      value: parseFloat(results.mealMacros.breakfast.fats) || 0,
    },
  ];

  const lunchPieData = [
    {
      name: "Protein",
      value: parseFloat(results.mealMacros.lunch.protein) || 0,
    },
    {
      name: "Carbs",
      value: parseFloat(results.mealMacros.lunch.carbs) || 0,
    },
    {
      name: "Fats",
      value: parseFloat(results.mealMacros.lunch.fats) || 0,
    },
  ];

  const dinnerPieData = [
    {
      name: "Protein",
      value: parseFloat(results.mealMacros.dinner.protein) || 0,
    },
    {
      name: "Carbs",
      value: parseFloat(results.mealMacros.dinner.carbs) || 0,
    },
    {
      name: "Fats",
      value: parseFloat(results.mealMacros.dinner.fats) || 0,
    },
  ];

  const structuredMealPlan = parseMealPlan(results.mealPlan);

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-navy">
            Your Personalized Nutrition Plan
          </h1>
          <p className="text-lg text-dark-gray mt-2">
            Tailored to your goals and preferences
          </p>
        </div>

        <div className="card mb-10">
          <h3 className="card-header text-navy">Recommended Daily Intake</h3>
          <div className="text-center">
            <p className="text-lg font-semibold">
              <strong>Calories:</strong> {results.adjustedCalories} kcal
            </p>
          </div>
        </div>

        <div className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Breakfast", data: breakfastPieData },
              { title: "Lunch", data: lunchPieData },
              { title: "Dinner", data: dinnerPieData },
            ].map((meal, i) => (
              <div className="card" key={i}>
                <h3 className="text-xl font-semibold text-navy mb-4">
                  {meal.title} Macronutrient Breakdown
                </h3>
                <PieChart width={300} height={300}>
                  <Pie
                    dataKey="value"
                    data={meal.data}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}g`}
                  >
                    {meal.data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value}g`} />
                  <Legend />
                </PieChart>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="card-header text-navy">Personalized Meal Plan</h3>
          <div className="text-dark-gray">
            {["breakfast", "lunch", "dinner", "snacks"].map((key) => {
              const items = structuredMealPlan[key as keyof StructuredMealPlan];
              return items.length > 0 ? (
                <div className="mb-4" key={key}>
                  <h4 className="text-lg font-semibold text-navy mb-2">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </h4>
                  <ul className="list-disc pl-5">
                    {items.map((item, index) => (
                      <li key={index} className="mb-1">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null;
            })}
          </div>
        </div>

        <div className="text-center mt-10">
          <Button
            onClick={() => router.push("/")}
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
