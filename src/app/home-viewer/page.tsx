"use client";

import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { gsap } from "gsap";
import { PlaceholderHome } from "../../components/PlaceholderHome";

type RoomPosition = {
  position: [number, number, number];
  target: [number, number, number];
};

type RoomPositions = {
  [key: string]: RoomPosition;
};

// Room positions for camera transitions
const ROOM_POSITIONS: RoomPositions = {
  overview: { position: [10, 5, 10], target: [0, 0, 0] },
  livingRoom: { position: [3, 2, 3], target: [0, 0, 0] },
  kitchen: { position: [-3, 2, 3], target: [-3, 0, 0] },
  bedroom: { position: [3, 2, -3], target: [3, 0, -3] },
  bathroom: { position: [-3, 2, -3], target: [-3, 0, -3] },
  outdoor: { position: [15, 5, 15], target: [0, 0, 0] },
  security: { position: [0, 8, 0], target: [0, 0, 0] },
};

interface NavButtonProps {
  icon: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

// Navigation Button component
const NavButton: React.FC<NavButtonProps> = ({
  icon,
  label,
  isSelected,
  onClick,
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex items-center gap-2 p-4 rounded-lg ${
      isSelected
        ? "bg-blue-500 text-white"
        : "bg-white/80 backdrop-blur-md hover:bg-blue-50"
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </motion.button>
);

interface RoomInfoProps {
  room: string;
  onClose: () => void;
}

// Room Info Modal component
const RoomInfo: React.FC<RoomInfoProps> = ({ room, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="absolute bottom-24 right-6 w-80 bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-lg"
  >
    <h3 className="text-xl font-bold mb-2">{room}</h3>
    <div className="space-y-2">
      <p className="text-sm text-gray-600">Temperature: 22°C</p>
      <p className="text-sm text-gray-600">Humidity: 45%</p>
      <p className="text-sm text-gray-600">Lights: On</p>
      <p className="text-sm text-gray-600">Devices: 4 Active</p>
    </div>
    <button
      onClick={onClose}
      className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
    >
      Close
    </button>
  </motion.div>
);

// Main Home Viewer component
export default function HomeViewer() {
  const [selectedRoom, setSelectedRoom] = useState<string>("overview");
  const [showInfo, setShowInfo] = useState(false);
  const [isDayMode, setIsDayMode] = useState(true);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const targetRef = useRef<THREE.Vector3>(new THREE.Vector3());

  const handleRoomSelect = (room: string) => {
    setSelectedRoom(room);
    setShowInfo(true);

    // Animate camera to new position
    if (cameraRef.current && ROOM_POSITIONS[room]) {
      const targetPos = ROOM_POSITIONS[room].position;
      const targetLook = ROOM_POSITIONS[room].target;

      gsap.to(cameraRef.current.position, {
        x: targetPos[0],
        y: targetPos[1],
        z: targetPos[2],
        duration: 2,
        ease: "power2.inOut",
      });

      // Update camera target
      gsap.to(targetRef.current, {
        x: targetLook[0],
        y: targetLook[1],
        z: targetLook[2],
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => {
          cameraRef.current?.lookAt(targetRef.current);
        },
      });
    }
  };

  return (
    <div className="w-full h-screen relative">
      {/* 3D Viewer */}
      <Canvas shadows>
        <PerspectiveCamera
          ref={cameraRef}
          makeDefault
          position={[10, 5, 10]}
          fov={75}
        />
        <OrbitControls enableDamping dampingFactor={0.05} />
        <Environment preset={isDayMode ? "sunset" : "night"} />

        {/* Lighting */}
        <ambientLight intensity={isDayMode ? 1 : 0.2} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={isDayMode ? 2 : 0.5}
          castShadow
        />

        {/* Home Model */}
        <PlaceholderHome selectedRoom={selectedRoom} />
      </Canvas>

      {/* Navigation Panel */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 space-y-2 bg-white/10 backdrop-blur-md p-4 rounded-xl">
        <NavButton
          icon="🏠"
          label="Overview"
          isSelected={selectedRoom === "overview"}
          onClick={() => handleRoomSelect("overview")}
        />
        <NavButton
          icon="🛋️"
          label="Living Room"
          isSelected={selectedRoom === "livingRoom"}
          onClick={() => handleRoomSelect("livingRoom")}
        />
        <NavButton
          icon="🍽️"
          label="Kitchen"
          isSelected={selectedRoom === "kitchen"}
          onClick={() => handleRoomSelect("kitchen")}
        />
        <NavButton
          icon="🛏️"
          label="Bedroom"
          isSelected={selectedRoom === "bedroom"}
          onClick={() => handleRoomSelect("bedroom")}
        />
        <NavButton
          icon="🚿"
          label="Bathroom"
          isSelected={selectedRoom === "bathroom"}
          onClick={() => handleRoomSelect("bathroom")}
        />
        <NavButton
          icon="🌳"
          label="Outdoor"
          isSelected={selectedRoom === "outdoor"}
          onClick={() => handleRoomSelect("outdoor")}
        />
        <NavButton
          icon="🔒"
          label="Security"
          isSelected={selectedRoom === "security"}
          onClick={() => handleRoomSelect("security")}
        />
        <NavButton
          icon="💡"
          label="Smart Controls"
          isSelected={selectedRoom === "controls"}
          onClick={() => handleRoomSelect("controls")}
        />
      </div>

      {/* Day/Night Toggle */}
      <button
        onClick={() => setIsDayMode(!isDayMode)}
        className="absolute top-6 right-6 bg-white/80 backdrop-blur-md p-4 rounded-full shadow-lg hover:bg-blue-50"
      >
        {isDayMode ? "🌙" : "☀️"}
      </button>

      {/* Mini-map */}
      <div className="absolute bottom-6 left-6 w-48 h-48 bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-2">
        <div className="w-full h-full border-2 border-blue-500 rounded-lg">
          {/* Add your floor plan SVG or image here */}
          <div className="relative w-full h-full">
            <div
              className="absolute w-2 h-2 bg-blue-500 rounded-full"
              style={{
                left: `${(ROOM_POSITIONS[selectedRoom].position[0] + 15) * 3}%`,
                top: `${(ROOM_POSITIONS[selectedRoom].position[2] + 15) * 3}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Room Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <RoomInfo room={selectedRoom} onClose={() => setShowInfo(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
