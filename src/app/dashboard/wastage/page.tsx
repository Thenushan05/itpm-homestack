"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

const WasteManagement: React.FC = () => {
  const [totalWaste, setTotalWaste] = useState<number>(0);
  const maxWaste = 150; // Max waste for full height
  const warningThreshold = maxWaste - 50; // 100 kg threshold

  // Calculate the exact fill height in percentage (0% to 100%)
  const binFill = (totalWaste / maxWaste) * 100;

  // Determine fill color based on waste level
  const fillColor =
    totalWaste >= maxWaste
      ? "rgba(255, 0, 0, 0.8)" // Red (Danger)
      : totalWaste >= warningThreshold
      ? "rgba(255, 165, 0, 0.8)" // Orange (Warning)
      : "rgba(0, 128, 255, 0.8)"; // Blue (Safe)

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

      {/* Buttons to Adjust Waste */}
      <div className="flex gap-4 mt-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setTotalWaste((prev) => Math.min(maxWaste, prev + 20))}
        >
          Increase
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded"
          onClick={() => setTotalWaste((prev) => Math.max(0, prev - 20))}
        >
          Decrease
        </button>
      </div>

      {/* Display Waste Level */}
      <p className="mt-2 text-lg font-semibold">
        {totalWaste} kg / {maxWaste} kg
      </p>
    </div>
  );
};

export default WasteManagement;
