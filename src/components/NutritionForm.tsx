import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// Define types for form inputs
interface FormData {
  age: number;
  weight: number;
  height: number;
  activityLevel: string;
  goal: string;
  dietPreference: string;
}

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
  error?: string;
}

const NutritionForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    age: 25,
    weight: 70,
    height: 170,
    activityLevel: "moderate",
    goal: "maintain",
    dietPreference: "none",
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const value = target.type === "number" ? parseFloat(target.value) || 0 : target.value;

    setFormData({
      ...formData,
      [target.name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const apiUrl = "/api/nutrition/calculate"; // Use proxy
      // Temporary workaround: Hardcode the URL if the proxy isn't working
      // const apiUrl = "http://localhost:3003/api/nutrition/calculate";
      console.log("📤 Sending request to:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch nutrition data: ${response.status} ${response.statusText} - ${
            errorData.error || "Unknown error"
          }`
        );
      }

      const data: NutritionResults = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to generate nutrition plan.");
      }

      // Navigate to the results page and pass the results via state
      navigate("/results", { state: { results: data } });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(errorMessage);
      console.error("❌ Fetch Error:", err);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "800px" }}>
      <h2 className="text-center mb-4">Personalized Nutrition Plan</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* Grid layout for form inputs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "20px" }}>
          <Form.Group controlId="age">
            <Form.Label>Age (years)</Form.Label>
            <Form.Control
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              style={{ borderRadius: "5px", padding: "10px" }}
            />
          </Form.Group>

          <Form.Group controlId="weight">
            <Form.Label>Weight (kg)</Form.Label>
            <Form.Control
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
              style={{ borderRadius: "5px", padding: "10px" }}
            />
          </Form.Group>

          <Form.Group controlId="height">
            <Form.Label>Height (cm)</Form.Label>
            <Form.Control
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              required
              style={{ borderRadius: "5px", padding: "10px" }}
            />
          </Form.Group>

          <Form.Group controlId="activityLevel">
            <Form.Label>Activity Level</Form.Label>
            <Form.Control
              as="select"
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleChange}
              required
              style={{ borderRadius: "5px", padding: "10px" }}
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Light Activity</option>
              <option value="moderate">Moderate Activity</option>
              <option value="active">Very Active</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="goal">
            <Form.Label>Goal</Form.Label>
            <Form.Control
              as="select"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              required
              style={{ borderRadius: "5px", padding: "10px" }}
            >
              <option value="lose">Lose Weight</option>
              <option value="maintain">Maintain Weight</option>
              <option value="gain">Gain Muscle</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="dietPreference">
            <Form.Label>Diet Preference</Form.Label>
            <Form.Control
              as="select"
              name="dietPreference"
              value={formData.dietPreference}
              onChange={handleChange}
              required
              style={{ borderRadius: "5px", padding: "10px" }}
            >
              <option value="none">No Preference</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="keto">Keto</option>
              <option value="paleo">Paleo</option>
              <option value="mediterranean">Mediterranean</option>
            </Form.Control>
          </Form.Group>
        </div>

        {/* Full-width button with dark background */}
        <Button
          type="submit"
          style={{
            backgroundColor: "#1A2526",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            width: "100%",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          Get Nutrition Plan
        </Button>
      </Form>
    </Container>
  );
};

export default NutritionForm;