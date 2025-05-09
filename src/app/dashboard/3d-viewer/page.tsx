"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { Environment } from "./Environment";

// Icons for the navigation panel
const icons = {
  exterior: "🏠",
  livingRoom: "🛋️",
  kitchen: "🍽️",
  bedroom: "🛏️",
  bathroom: "🚿",
  utility: "🌀",
  smartDevices: "🔧",
  dashboard: "📊",
  pool: "🏊‍♂️",
  backyard: "🌳",
};

interface RoomInfo {
  name: string;
  floor: number;
  icon: string;
  temperature: number;
  humidity: number;
  lightLevel: number;
  occupancy: boolean;
}

// Keep only the used room data
const rooms: Record<string, RoomInfo> = {
  livingRoom: {
    name: "Living Room",
    floor: 1,
    icon: icons.livingRoom,
    temperature: 22,
    humidity: 45,
    lightLevel: 80,
    occupancy: true,
  },
  kitchen: {
    name: "Kitchen",
    floor: 1,
    icon: icons.kitchen,
    temperature: 23,
    humidity: 50,
    lightLevel: 90,
    occupancy: false,
  },
  diningRoom: {
    name: "Dining Room",
    floor: 1,
    icon: "🪑",
    temperature: 22,
    humidity: 45,
    lightLevel: 85,
    occupancy: false,
  },
  masterBedroom: {
    name: "Master Bedroom",
    floor: 2,
    icon: icons.bedroom,
    temperature: 21,
    humidity: 40,
    lightLevel: 60,
    occupancy: false,
  },
  bedroom2: {
    name: "Bedroom 2",
    floor: 2,
    icon: icons.bedroom,
    temperature: 21,
    humidity: 40,
    lightLevel: 0,
    occupancy: false,
  },
  office: {
    name: "Home Office",
    floor: 1,
    icon: "💼",
    temperature: 22,
    humidity: 45,
    lightLevel: 90,
    occupancy: false,
  },
  pool: {
    name: "Swimming Pool",
    floor: 1,
    icon: icons.pool,
    temperature: 26,
    humidity: 65,
    lightLevel: 100,
    occupancy: false,
  },
  backyard: {
    name: "Backyard",
    floor: 1,
    icon: icons.backyard,
    temperature: 22,
    humidity: 40,
    lightLevel: 100,
    occupancy: false,
  },
};

interface ViewerState {
  activeRoom: string;
  isDayMode: boolean;
  showInfo: boolean;
  selectedObject: string | null;
  isInteriorView: boolean;
  isWalking: boolean;
  showStarfield: boolean;
}

// Add control modes
const ControlMode = {
  ORBIT: "orbit",
  FIRST_PERSON: "firstPerson",
  POINTER_LOCK: "pointerLock",
} as const;

type ControlModeType = (typeof ControlMode)[keyof typeof ControlMode];

interface InteractiveObject {
  id: string;
  type: "light" | "thermostat" | "door" | "window" | "appliance";
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  state: {
    isOn?: boolean;
    temperature?: number;
    isOpen?: boolean;
    color?: string;
  };
}

interface RoomMetadata {
  name: string;
  temperature: number;
  humidity: number;
  lightLevel: number;
  occupancy: boolean;
  devices: InteractiveObject[];
}

const roomsMetadata: Record<string, RoomMetadata> = {
  livingRoom: {
    name: "Living Room",
    temperature: 22,
    humidity: 45,
    lightLevel: 80,
    occupancy: true,
    devices: [
      {
        id: "light_1",
        type: "light",
        position: new THREE.Vector3(0, 2.5, 0),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        state: { isOn: true, color: "#ffffff" },
      },
      {
        id: "thermostat_1",
        type: "thermostat",
        position: new THREE.Vector3(1.5, 1.5, 0),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(0.2, 0.2, 0.2),
        state: { temperature: 22 },
      },
    ],
  },
  kitchen: {
    name: "Kitchen",
    temperature: 23,
    humidity: 50,
    lightLevel: 90,
    occupancy: false,
    devices: [
      {
        id: "light_2",
        type: "light",
        position: new THREE.Vector3(-2.5, 2.5, 0),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        state: { isOn: true, color: "#ffffff" },
      },
      {
        id: "fridge_1",
        type: "appliance",
        position: new THREE.Vector3(-3, 1, -1),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(0.8, 2, 0.8),
        state: { isOpen: false },
      },
    ],
  },
  // Add more rooms...
};

interface RoomPosition {
  position: THREE.Vector3;
  target: THREE.Vector3;
  floor: number;
}

type RoomKey = keyof typeof rooms;

const roomPositions: Record<RoomKey, RoomPosition> = {
  livingRoom: {
    position: new THREE.Vector3(0, 1.7, 6),
    target: new THREE.Vector3(0, 1.7, 0),
    floor: 1,
  },
  kitchen: {
    position: new THREE.Vector3(-6, 1.7, 0),
    target: new THREE.Vector3(-2, 1.7, 0),
    floor: 1,
  },
  diningRoom: {
    position: new THREE.Vector3(-2, 1.7, 2),
    target: new THREE.Vector3(-2, 1.7, -2),
    floor: 1,
  },
  masterBedroom: {
    position: new THREE.Vector3(6, 5.7, -4),
    target: new THREE.Vector3(6, 5.7, -2),
    floor: 2,
  },
  bedroom2: {
    position: new THREE.Vector3(4, 5.7, -6),
    target: new THREE.Vector3(4, 5.7, -4),
    floor: 2,
  },
  office: {
    position: new THREE.Vector3(6, 1.7, -2),
    target: new THREE.Vector3(2, 1.7, -2),
    floor: 1,
  },
  pool: {
    position: new THREE.Vector3(0, 1.7, -15),
    target: new THREE.Vector3(0, 0, -18),
    floor: 1,
  },
  backyard: {
    position: new THREE.Vector3(10, 2, -15),
    target: new THREE.Vector3(0, 0, -15),
    floor: 1,
  },
};

const createSampleHouse = () => {
  const houseGroup = new THREE.Group();

  // Materials with better PBR properties
  const wallsMaterial = new THREE.MeshStandardMaterial({
    color: 0xf0f0f0,
    roughness: 0.9,
    metalness: 0.1,
  });

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.8,
    metalness: 0.2,
    envMapIntensity: 1.5,
  });

  const roofMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a4a4a,
    roughness: 0.7,
    metalness: 0.3,
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.3,
    roughness: 0,
    metalness: 1,
    envMapIntensity: 2,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  });

  // Create room lights
  const createRoomLight = (
    x: number,
    y: number,
    z: number,
    intensity: number = 1
  ) => {
    const light = new THREE.PointLight(0xffffff, intensity, 10);
    light.position.set(x, y, z);
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.radius = 5;
    return light;
  };

  // Add room lights
  const roomLights = {
    livingRoom: createRoomLight(0, 2.5, 0),
    kitchen: createRoomLight(-6, 2.5, 0),
    diningRoom: createRoomLight(-2, 2.5, 2),
    masterBedroom: createRoomLight(6, 6.5, -4),
    bedroom2: createRoomLight(4, 6.5, -6),
    office: createRoomLight(6, 2.5, -2),
  };

  // Add lights to house
  Object.values(roomLights).forEach((light) => {
    houseGroup.add(light);
  });

  // Add ambient light for base illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  houseGroup.add(ambientLight);

  // Create furniture
  const createFurniture = () => {
    const furnitureGroup = new THREE.Group();

    // Materials
    const woodMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.8,
      metalness: 0.2,
    });
    const fabricMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      roughness: 0.9,
      metalness: 0.1,
    });
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.2,
      metalness: 0.8,
    });
    const mattressMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      roughness: 0.9,
      metalness: 0.1,
    });

    // Living Room
    const createLivingRoom = () => {
      const group = new THREE.Group();

      // Sofa
      const sofa = new THREE.Group();
      const sofaBase = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.5, 1.2),
        fabricMaterial
      );
      const sofaBack = new THREE.Mesh(
        new THREE.BoxGeometry(3, 1, 0.3),
        fabricMaterial
      );
      sofaBack.position.set(0, 0.75, -0.45);
      const sofaCushions = Array(3)
        .fill(null)
        .map((_, i) => {
          const cushion = new THREE.Mesh(
            new THREE.BoxGeometry(0.9, 0.3, 0.8),
            new THREE.MeshStandardMaterial({ color: 0x777777 })
          );
          cushion.position.set(-1 + i, 0.4, 0);
          return cushion;
        });
      sofa.add(sofaBase, sofaBack, ...sofaCushions);
      sofa.position.set(0, 0.25, 2);
      group.add(sofa);

      // Coffee Table
      const coffeeTable = new THREE.Group();
      const tableTop = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.1, 0.8),
        woodMaterial
      );
      const tableLeg1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.4, 0.1),
        woodMaterial
      );
      tableLeg1.position.set(-0.6, -0.25, 0.3);
      const tableLeg2 = tableLeg1.clone();
      tableLeg2.position.set(0.6, -0.25, 0.3);
      const tableLeg3 = tableLeg1.clone();
      tableLeg3.position.set(-0.6, -0.25, -0.3);
      const tableLeg4 = tableLeg1.clone();
      tableLeg4.position.set(0.6, -0.25, -0.3);
      coffeeTable.add(tableTop, tableLeg1, tableLeg2, tableLeg3, tableLeg4);
      coffeeTable.position.set(0, 0.45, 0.8);
      group.add(coffeeTable);

      return group;
    };

    // Kitchen
    const createKitchen = () => {
      const group = new THREE.Group();

      // Counter with cabinets
      const counter = new THREE.Group();
      const counterTop = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.1, 1),
        new THREE.MeshStandardMaterial({ color: 0xcccccc })
      );
      const cabinet = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.9, 0.9),
        woodMaterial
      );
      cabinet.position.y = -0.5;
      counter.add(counterTop, cabinet);
      counter.position.set(-6, 0.9, -1);
      group.add(counter);

      // Upper cabinets
      const upperCabinet = new THREE.Mesh(
        new THREE.BoxGeometry(4, 1, 0.4),
        woodMaterial
      );
      upperCabinet.position.set(-6, 2.2, -1.25);
      group.add(upperCabinet);

      // Sink
      const sink = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.1, 0.6),
        metalMaterial
      );
      sink.position.set(-5, 0.96, -1);
      group.add(sink);

      // Stove
      const stove = new THREE.Group();
      const stoveBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.9, 0.9),
        metalMaterial
      );
      const stovetop = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.02, 0.9),
        new THREE.MeshStandardMaterial({ color: 0x111111 })
      );
      stovetop.position.y = 0.46;
      const burners = Array(4)
        .fill(null)
        .map((_, i) => {
          const burner = new THREE.Mesh(
            new THREE.CircleGeometry(0.1, 16),
            new THREE.MeshStandardMaterial({ color: 0x333333 })
          );
          burner.rotation.x = -Math.PI / 2;
          burner.position.set(
            -0.2 + (i % 2) * 0.4,
            0.47,
            -0.2 + Math.floor(i / 2) * 0.4
          );
          return burner;
        });
      stove.add(stoveBase, stovetop, ...burners);
      stove.position.set(-4, 0.45, -1);
      group.add(stove);

      // Refrigerator
      const fridge = new THREE.Group();
      const fridgeBody = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, 0.8),
        metalMaterial
      );
      const fridgeHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.8),
        metalMaterial
      );
      fridgeHandle.rotation.x = Math.PI / 2;
      fridgeHandle.position.set(0.52, 0, 0);
      fridge.add(fridgeBody, fridgeHandle);
      fridge.position.set(-7.5, 1, -1);
      group.add(fridge);

      return group;
    };

    // Master Bedroom
    const createMasterBedroom = () => {
      const group = new THREE.Group();

      // Bed
      const bed = new THREE.Group();
      const bedFrame = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.3, 2.4),
        woodMaterial
      );
      const mattress = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.3, 2),
        mattressMaterial
      );
      mattress.position.y = 0.3;

      // Add bedding
      const bedding = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.1, 2),
        new THREE.MeshStandardMaterial({
          color: 0x4169e1, // Royal blue
          roughness: 0.7,
          metalness: 0.1,
        })
      );
      bedding.position.y = 0.35;

      // Add decorative pillows
      const createPillow = (x: number, color: number) => {
        const pillow = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.15, 0.4),
          new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.5,
            metalness: 0.1,
          })
        );
        pillow.position.set(x, 0.5, -0.8);
        return pillow;
      };

      const pillows = [
        createPillow(-0.4, 0xffffff), // White pillow
        createPillow(0.4, 0xffffff), // White pillow
        createPillow(-0.2, 0x4169e1), // Blue decorative pillow
        createPillow(0.2, 0x4169e1), // Blue decorative pillow
      ];

      const headboard = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1.2, 0.2),
        woodMaterial
      );
      headboard.position.set(0, 0.6, -1.1);

      bed.add(bedFrame, mattress, bedding, headboard, ...pillows);
      bed.position.set(6, 4.15, -4);
      group.add(bed);

      // Nightstands (two of them)
      const createNightstand = (x: number) => {
        const nightstand = new THREE.Group();

        // Main body
        const nightstandBody = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.6, 0.6),
          woodMaterial
        );

        // Drawer
        const nightstandDrawer = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.2, 0.55),
          woodMaterial
        );
        nightstandDrawer.position.y = -0.1;

        // Handle
        const nightstandHandle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.1),
          metalMaterial
        );
        nightstandHandle.rotation.z = Math.PI / 2;
        nightstandHandle.position.set(0, -0.1, 0.25);

        // Lamp
        const lamp = new THREE.Group();
        const lampBase = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.15, 0.05, 8),
          metalMaterial
        );
        const lampPost = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8),
          metalMaterial
        );
        lampPost.position.y = 0.15;
        const lampShade = new THREE.Mesh(
          new THREE.ConeGeometry(0.2, 0.3, 8, 1, true),
          new THREE.MeshStandardMaterial({
            color: 0xf5f5f5,
            roughness: 0.5,
            metalness: 0.1,
          })
        );
        lampShade.position.y = 0.3;
        lamp.add(lampBase, lampPost, lampShade);
        lamp.position.y = 0.3;

        nightstand.add(
          nightstandBody,
          nightstandDrawer,
          nightstandHandle,
          lamp
        );
        nightstand.position.set(x, 4.3, -4.8);
        return nightstand;
      };

      group.add(createNightstand(7.2), createNightstand(4.8));

      // Dresser with mirror
      const dresser = new THREE.Group();

      // Main body
      const dresserBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 1.2, 0.6),
        woodMaterial
      );

      // Mirror
      const mirrorFrame = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 1.8, 0.1),
        woodMaterial
      );
      mirrorFrame.position.set(0, 1.5, 0);

      const mirror = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 1.6),
        new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          metalness: 0.9,
          roughness: 0.1,
          envMapIntensity: 1.5,
          reflectivity: 1.0,
        })
      );
      mirror.position.set(0, 1.5, 0.06);

      // Drawers
      const drawers = Array(6)
        .fill(null)
        .map((_, i) => {
          const drawer = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.35, 0.55),
            woodMaterial
          );
          drawer.position.set(
            -0.45 + (i % 2) * 0.9,
            -0.4 + Math.floor(i / 2) * 0.4,
            0
          );

          // Drawer handles
          const handle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.2),
            metalMaterial
          );
          handle.rotation.z = Math.PI / 2;
          handle.position.z = 0.275;
          drawer.add(handle);

          return drawer;
        });

      dresser.add(dresserBody, mirrorFrame, mirror, ...drawers);
      dresser.position.set(4.5, 4.6, -5.5);
      group.add(dresser);

      // Add a decorative rug
      const rug = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 2),
        new THREE.MeshStandardMaterial({
          color: 0x8b4513, // Saddle brown
          roughness: 0.9,
          metalness: 0.1,
          side: THREE.DoubleSide,
        })
      );
      rug.rotation.x = -Math.PI / 2;
      rug.position.set(6, 4.02, -4);
      group.add(rug);

      // Add some wall art
      const createWallArt = (x: number, z: number) => {
        const frame = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 1, 0.1),
          woodMaterial
        );
        const art = new THREE.Mesh(
          new THREE.PlaneGeometry(0.7, 0.9),
          new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5),
            roughness: 0.7,
            metalness: 0.1,
          })
        );
        art.position.z = 0.06;
        frame.add(art);
        frame.position.set(x, 5.5, z);
        return frame;
      };

      group.add(
        createWallArt(4.5, -5.9),
        createWallArt(6.0, -5.9),
        createWallArt(7.5, -5.9)
      );

      return group;
    };

    // Second Bedroom
    const createSecondBedroom = () => {
      const group = new THREE.Group();

      // Single Bed
      const bed = new THREE.Group();
      const bedFrame = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.3, 2.2),
        woodMaterial
      );
      const mattress = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.3, 2),
        mattressMaterial
      );
      mattress.position.y = 0.3;

      // Add bedding
      const bedding = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.1, 2),
        new THREE.MeshStandardMaterial({
          color: 0x20b2aa, // Light sea green
          roughness: 0.7,
          metalness: 0.1,
        })
      );
      bedding.position.y = 0.35;

      // Add pillows
      const createPillow = (x: number, color: number) => {
        const pillow = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.15, 0.4),
          new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.5,
            metalness: 0.1,
          })
        );
        pillow.position.set(x, 0.5, -0.7);
        return pillow;
      };

      const pillows = [
        createPillow(-0.2, 0xffffff), // White pillow
        createPillow(0.2, 0xffffff), // White pillow
        createPillow(0, 0x20b2aa), // Matching decorative pillow
      ];

      const headboard = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1, 0.2),
        woodMaterial
      );
      headboard.position.set(0, 0.5, -1);

      bed.add(bedFrame, mattress, bedding, headboard, ...pillows);
      bed.position.set(4, 4.15, -6);
      group.add(bed);

      // Study Desk with storage
      const desk = new THREE.Group();

      // Desktop
      const deskTop = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.05, 0.8),
        woodMaterial
      );

      // Storage unit
      const storage = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.7, 0.75),
        woodMaterial
      );
      storage.position.set(-0.5, -0.35, 0);

      // Drawers in storage unit
      const drawers = Array(2)
        .fill(null)
        .map((_, i) => {
          const drawer = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.3, 0.7),
            woodMaterial
          );
          drawer.position.set(-0.5, -0.5 + i * 0.33, 0);

          // Drawer handle
          const handle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.2),
            metalMaterial
          );
          handle.rotation.z = Math.PI / 2;
          handle.position.z = 0.35;
          drawer.add(handle);

          return drawer;
        });

      // Desk legs
      const deskLegs = Array(3)
        .fill(null)
        .map((_, i) => {
          const leg = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.75, 0.05),
            woodMaterial
          );
          leg.position.set(
            i === 2 ? 0.65 : 0.65,
            -0.375,
            i === 2 ? 0 : i === 0 ? 0.35 : -0.35
          );
          return leg;
        });

      // Add desk lamp
      const lamp = new THREE.Group();
      const lampBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.15, 0.05, 8),
        metalMaterial
      );
      const lampArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.05, 0.05),
        metalMaterial
      );
      lampArm.position.set(0.15, 0.15, 0);
      const lampHead = new THREE.Mesh(
        new THREE.ConeGeometry(0.1, 0.2, 8, 1, true),
        new THREE.MeshStandardMaterial({
          color: 0x20b2aa,
          roughness: 0.5,
          metalness: 0.1,
        })
      );
      lampHead.rotation.z = Math.PI / 4;
      lampHead.position.set(0.3, 0.15, 0);
      lamp.add(lampBase, lampArm, lampHead);
      lamp.position.set(0.5, 0.025, 0.2);

      desk.add(deskTop, storage, ...drawers, ...deskLegs, lamp);
      desk.position.set(3, 4.4, -7);
      group.add(desk);

      // Modern desk chair
      const chair = new THREE.Group();

      // Seat
      const chairSeat = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.1, 0.5),
        new THREE.MeshStandardMaterial({
          color: 0x20b2aa,
          roughness: 0.7,
          metalness: 0.1,
        })
      );

      // Back
      const chairBack = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.6, 0.1),
        new THREE.MeshStandardMaterial({
          color: 0x20b2aa,
          roughness: 0.7,
          metalness: 0.1,
        })
      );
      chairBack.position.set(0, 0.35, -0.2);
      chairBack.rotation.x = Math.PI * 0.1;

      // Chair base
      const chairBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.05, 8),
        metalMaterial
      );
      chairBase.position.y = -0.2;

      // Chair post
      const chairPost = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8),
        metalMaterial
      );
      chairPost.position.y = 0;

      chair.add(chairBase, chairPost, chairSeat, chairBack);
      chair.position.set(3, 4.2, -6.7);
      group.add(chair);

      // Bookshelf
      const bookshelf = new THREE.Group();
      const shelfUnit = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 2, 0.4),
        woodMaterial
      );

      // Add shelves
      const shelves = Array(4)
        .fill(null)
        .map((_, i) => {
          const shelf = new THREE.Mesh(
            new THREE.BoxGeometry(1.1, 0.05, 0.35),
            woodMaterial
          );
          shelf.position.y = -0.8 + i * 0.5;
          return shelf;
        });

      // Add books and decorations
      const createBook = (x: number, y: number, color: number) => {
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.25, 0.25),
          new THREE.MeshStandardMaterial({ color })
        );
        book.position.set(x, y, 0);
        return book;
      };

      const books = [];
      for (let shelf = 0; shelf < 4; shelf++) {
        for (let i = 0; i < 3; i++) {
          const color = new THREE.Color().setHSL(Math.random(), 0.7, 0.5);
          books.push(
            createBook(-0.4 + i * 0.3, -0.65 + shelf * 0.5, color.getHex())
          );
        }
      }

      // Add some decorative items
      const createDecoration = (x: number, y: number) => {
        const decoration = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 8, 8),
          new THREE.MeshStandardMaterial({
            color: 0x20b2aa,
            roughness: 0.3,
            metalness: 0.7,
          })
        );
        decoration.position.set(x, y, 0);
        return decoration;
      };

      bookshelf.add(
        shelfUnit,
        ...shelves,
        ...books,
        createDecoration(0.3, 0.85),
        createDecoration(-0.3, 0.35)
      );
      bookshelf.position.set(5.2, 5, -7);
      group.add(bookshelf);

      // Add a small rug
      const rug = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 1.5),
        new THREE.MeshStandardMaterial({
          color: 0xf0f0f0, // Light gray
          roughness: 0.9,
          metalness: 0.1,
          side: THREE.DoubleSide,
        })
      );
      rug.rotation.x = -Math.PI / 2;
      rug.position.set(4, 4.02, -6);
      group.add(rug);

      // Add wall art
      const createWallArt = (x: number, z: number) => {
        const frame = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.8, 0.1),
          woodMaterial
        );
        const art = new THREE.Mesh(
          new THREE.PlaneGeometry(0.5, 0.7),
          new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5),
            roughness: 0.7,
            metalness: 0.1,
          })
        );
        art.position.z = 0.06;
        frame.add(art);
        frame.position.set(x, 5.5, z);
        return frame;
      };

      group.add(createWallArt(3.5, -7.4), createWallArt(4.5, -7.4));

      return group;
    };

    // Home Office
    const createOffice = () => {
      const group = new THREE.Group();

      // Large Desk
      const desk = new THREE.Group();
      const deskTop = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.05, 0.8),
        woodMaterial
      );
      const deskDrawer = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.4, 0.7),
        woodMaterial
      );
      deskDrawer.position.set(-0.7, -0.2, 0);
      const deskLegs = Array(3)
        .fill(null)
        .map((_, i) => {
          const leg = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.75, 0.05),
            woodMaterial
          );
          leg.position.set(
            i === 0 ? 0.9 : i === 1 ? 0.9 : -0.9,
            -0.375,
            i === 2 ? 0 : i === 0 ? 0.35 : -0.35
          );
          return leg;
        });
      desk.add(deskTop, deskDrawer, ...deskLegs);
      desk.position.set(6, 0.4, -2);
      group.add(desk);

      // Office Chair
      const chair = new THREE.Group();
      const chairBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.05, 8),
        metalMaterial
      );
      const chairSeat = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.1, 0.5),
        fabricMaterial
      );
      chairSeat.position.y = 0.3;
      const chairBack = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.6, 0.1),
        fabricMaterial
      );
      chairBack.position.set(0, 0.6, -0.2);
      chair.add(chairBase, chairSeat, chairBack);
      chair.position.set(6, 0.4, -1.4);
      group.add(chair);

      // Bookshelf
      const bookshelf = new THREE.Group();
      const shelfFrame = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 2, 0.4),
        woodMaterial
      );
      const shelves = Array(4)
        .fill(null)
        .map((_, i) => {
          const shelf = new THREE.Mesh(
            new THREE.BoxGeometry(1.7, 0.05, 0.35),
            woodMaterial
          );
          shelf.position.y = -0.9 + i * 0.5;
          return shelf;
        });
      // Add some books (simplified as colored boxes)
      const books = Array(12)
        .fill(null)
        .map((_, i) => {
          const book = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.25, 0.25),
            new THREE.MeshStandardMaterial({
              color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
            })
          );
          book.position.set(
            -0.7 + (i % 3) * 0.4,
            -0.75 + Math.floor(i / 3) * 0.5,
            0
          );
          return book;
        });
      bookshelf.add(shelfFrame, ...shelves, ...books);
      bookshelf.position.set(7.5, 1, -2);
      group.add(bookshelf);

      return group;
    };

    // Add all room furniture
    furnitureGroup.add(
      createLivingRoom(),
      createKitchen(),
      createMasterBedroom(),
      createSecondBedroom(),
      createOffice()
    );

    return furnitureGroup;
  };

  // Add furniture to house
  const furniture = createFurniture();
  houseGroup.add(furniture);

  // Foundation
  const foundation = new THREE.Mesh(
    new THREE.BoxGeometry(30, 0.5, 25),
    new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.9 })
  );
  foundation.position.y = -0.25;
  foundation.receiveShadow = true;
  houseGroup.add(foundation);

  // First Floor
  const firstFloor = new THREE.Group();
  firstFloor.position.y = 0;

  // Main walls
  const walls = new THREE.Mesh(new THREE.BoxGeometry(29, 4, 24), wallsMaterial);
  walls.position.y = 2;
  walls.castShadow = true;
  walls.receiveShadow = true;
  firstFloor.add(walls);

  // Floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(29, 24), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.01;
  floor.receiveShadow = true;
  firstFloor.add(floor);

  // Second Floor
  const secondFloor = new THREE.Group();
  secondFloor.position.y = 4;

  // Second floor walls
  const upperWalls = new THREE.Mesh(
    new THREE.BoxGeometry(29, 4, 24),
    wallsMaterial
  );
  upperWalls.position.y = 2;
  upperWalls.castShadow = true;
  upperWalls.receiveShadow = true;
  secondFloor.add(upperWalls);

  // Second floor base
  const secondFloorBase = new THREE.Mesh(
    new THREE.BoxGeometry(29, 0.3, 24),
    floorMaterial
  );
  secondFloorBase.position.y = 0;
  secondFloorBase.receiveShadow = true;
  secondFloor.add(secondFloorBase);

  // Roof
  const roofGroup = new THREE.Group();
  roofGroup.position.y = 8;

  // Main roof
  const roofGeometry = new THREE.ConeGeometry(21, 6, 4);
  const mainRoof = new THREE.Mesh(roofGeometry, roofMaterial);
  mainRoof.rotation.y = Math.PI / 4;
  mainRoof.position.y = 3;
  mainRoof.castShadow = true;
  roofGroup.add(mainRoof);

  // Windows function
  const createWindow = (
    width: number,
    height: number,
    x: number,
    y: number,
    z: number,
    rotationY: number = 0
  ) => {
    const windowGroup = new THREE.Group();

    // Frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.2, height + 0.2, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5 })
    );

    // Glass
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, 0.1),
      glassMaterial
    );
    glass.position.z = 0.1;

    windowGroup.add(frame);
    windowGroup.add(glass);
    windowGroup.position.set(x, y, z);
    windowGroup.rotation.y = rotationY;
    return windowGroup;
  };

  // Add windows to first floor
  Object.entries({
    front: [
      { x: -10, z: 12, rot: 0 },
      { x: 0, z: 12, rot: 0 },
      { x: 10, z: 12, rot: 0 },
    ],
    back: [
      { x: -10, z: -12, rot: Math.PI },
      { x: 0, z: -12, rot: Math.PI },
      { x: 10, z: -12, rot: Math.PI },
    ],
    sides: [
      { x: -14.5, z: 0, rot: Math.PI / 2 },
      { x: 14.5, z: 0, rot: -Math.PI / 2 },
    ],
  }).forEach(([, windows]) => {
    windows.forEach(({ x, z, rot }) => {
      const window = createWindow(2.5, 2, x, 2, z, rot);
      firstFloor.add(window);
    });
  });

  // Add windows to second floor
  Object.entries({
    front: [
      { x: -10, z: 12, rot: 0 },
      { x: 10, z: 12, rot: 0 },
    ],
    back: [
      { x: -10, z: -12, rot: Math.PI },
      { x: 10, z: -12, rot: Math.PI },
    ],
    sides: [
      { x: -14.5, z: 0, rot: Math.PI / 2 },
      { x: 14.5, z: 0, rot: -Math.PI / 2 },
    ],
  }).forEach(([, windows]) => {
    windows.forEach(({ x, z, rot }) => {
      const window = createWindow(2.5, 2, x, 6, z, rot);
      secondFloor.add(window);
    });
  });

  // Create main door
  const doorGroup = new THREE.Group();
  const doorFrame = new THREE.Mesh(
    new THREE.BoxGeometry(2, 3.5, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 })
  );
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 3.3, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x4a3219, roughness: 0.7 })
  );
  door.position.z = 0.1;
  doorGroup.add(doorFrame);
  doorGroup.add(door);
  doorGroup.position.set(0, 1.75, 12);
  firstFloor.add(doorGroup);

  // Add all elements to house group
  houseGroup.add(firstFloor);
  houseGroup.add(secondFloor);
  houseGroup.add(roofGroup);

  // Center the house
  houseGroup.position.y = 0;

  // Add outdoor area
  const outdoorArea = createOutdoorArea();
  houseGroup.add(outdoorArea);

  return houseGroup;
};

// Create outdoor area function
const createOutdoorArea = () => {
  const group = new THREE.Group();

  // Swimming Pool
  const poolGroup = new THREE.Group();

  // Pool water
  const waterGeometry = new THREE.BoxGeometry(8, 0.1, 6);
  const waterMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x4facf7,
    transparent: true,
    opacity: 0.8,
    roughness: 0,
    metalness: 0.1,
    transmission: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  });
  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.position.y = -0.4;

  // Pool walls
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.8,
  });
  const poolWalls = [
    // Bottom
    new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.2, 6.4), wallMaterial),
    // Sides
    new THREE.Mesh(new THREE.BoxGeometry(0.2, 1, 6.4), wallMaterial),
    new THREE.Mesh(new THREE.BoxGeometry(0.2, 1, 6.4), wallMaterial),
    new THREE.Mesh(new THREE.BoxGeometry(8.4, 1, 0.2), wallMaterial),
    new THREE.Mesh(new THREE.BoxGeometry(8.4, 1, 0.2), wallMaterial),
  ];

  poolWalls[0].position.y = -0.9;
  poolWalls[1].position.set(-4.1, -0.4, 0);
  poolWalls[2].position.set(4.1, -0.4, 0);
  poolWalls[3].position.set(0, -0.4, -3.1);
  poolWalls[4].position.set(0, -0.4, 3.1);

  poolGroup.add(water, ...poolWalls);
  poolGroup.position.set(0, 0, -18);
  group.add(poolGroup);

  // Pool deck
  const deckGeometry = new THREE.BoxGeometry(12, 0.2, 10);
  const deckMaterial = new THREE.MeshStandardMaterial({
    color: 0xe0e0e0,
    roughness: 0.9,
  });
  const deck = new THREE.Mesh(deckGeometry, deckMaterial);
  deck.position.set(0, -0.1, -18);
  group.add(deck);

  // Pool chairs
  const createPoolChair = (x: number, z: number, rotation: number = 0) => {
    const chair = new THREE.Group();

    // Base
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.1, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x666666 })
    );

    // Back
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.6, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x666666 })
    );
    back.position.set(0, 0.3, -0.25);
    back.rotation.x = Math.PI * 0.2;

    chair.add(base, back);
    chair.position.set(x, 0.1, z);
    chair.rotation.y = rotation;
    return chair;
  };

  // Add pool chairs
  const chairs = [
    createPoolChair(-3, -15),
    createPoolChair(0, -15),
    createPoolChair(3, -15),
    createPoolChair(-3, -21),
    createPoolChair(0, -21),
    createPoolChair(3, -21),
  ];
  group.add(...chairs);

  // Add some plants
  const createPlant = (x: number, z: number) => {
    const plant = new THREE.Group();

    // Pot
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.2, 0.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x8b4513 })
    );

    // Leaves (simplified as spheres)
    const leaves = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x228b22 })
    );
    leaves.position.y = 0.4;

    plant.add(pot, leaves);
    plant.position.set(x, 0, z);
    return plant;
  };

  // Add plants around the pool
  const plants = [
    createPlant(-5, -14),
    createPlant(-5, -18),
    createPlant(-5, -22),
    createPlant(5, -14),
    createPlant(5, -18),
    createPlant(5, -22),
  ];
  group.add(...plants);

  return group;
};

const HouseViewer = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const houseRef = useRef<THREE.Group | null>(null);

  const [isDayTime, setIsDayTime] = useState(true);
  const [activeFloor, setActiveFloor] = useState(1);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"exterior" | "interior" | "xray">(
    "exterior"
  );
  const [roomLights, setRoomLights] = useState<Record<string, boolean>>({
    livingRoom: true,
    kitchen: true,
    diningRoom: true,
    masterBedroom: true,
    bedroom2: true,
    office: true,
    pool: true,
    backyard: true,
  });
  const [showRoomInfo, setShowRoomInfo] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(40, 20, 40);
    cameraRef.current = camera;

    // Renderer setup with context loss handling
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "default", // Changed from high-performance to default
      failIfMajorPerformanceCaveat: false, // Allow fallback to software rendering
    });

    // Handle context loss
    renderer.domElement.addEventListener(
      "webglcontextlost",
      (event) => {
        event.preventDefault();
        console.warn("WebGL context lost. Attempting to restore...");
      },
      false
    );

    renderer.domElement.addEventListener(
      "webglcontextrestored",
      () => {
        console.log("WebGL context restored.");
        if (sceneRef.current && cameraRef.current) {
          renderer.render(sceneRef.current, cameraRef.current);
        }
      },
      false
    );

    try {
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(1); // Set to 1 for better performance
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      mountRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Controls setup
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 1;
      controls.maxDistance = 100;
      controls.maxPolarAngle = Math.PI;
      controls.target.set(0, 5, 0);
      controls.update();
      controlsRef.current = controls;

      // Create house
      const house = createSampleHouse();
      scene.add(house);
      houseRef.current = house;

      // Add a ground plane
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshStandardMaterial({
          color: 0x7ec850,
          roughness: 0.8,
          metalness: 0.1,
        })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.5;
      ground.receiveShadow = true;
      scene.add(ground);

      // Animation loop with error handling
      let isAnimating = true;
      const animate = () => {
        if (!isAnimating) return;

        try {
          if (controlsRef.current) {
            controlsRef.current.update();
          }
          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
          requestAnimationFrame(animate);
        } catch (error) {
          console.error("Animation error:", error);
          isAnimating = false;
        }
      };

      // Start animation after a short delay
      setTimeout(() => {
        setIsLoading(false);
        animate();
      }, 100);

      // Handle resize
      const handleResize = () => {
        if (!mountRef.current || !renderer || !camera) return;
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      window.addEventListener("resize", handleResize);

      // Cleanup function
      return () => {
        isAnimating = false;
        window.removeEventListener("resize", handleResize);

        if (controlsRef.current) {
          controlsRef.current.dispose();
        }

        if (rendererRef.current) {
          rendererRef.current.dispose();
          if (rendererRef.current.domElement.parentNode) {
            rendererRef.current.domElement.parentNode.removeChild(
              rendererRef.current.domElement
            );
          }
        }

        // Clear references
        sceneRef.current = null;
        cameraRef.current = null;
        controlsRef.current = null;
        rendererRef.current = null;
        houseRef.current = null;
      };
    } catch (error) {
      console.error("Setup error:", error);
      setIsLoading(false);
      return () => {};
    }
  }, []);

  // Handle view mode changes
  useEffect(() => {
    if (!houseRef.current) return;

    switch (viewMode) {
      case "interior":
        if (cameraRef.current && controlsRef.current) {
          cameraRef.current.position.set(0, 1.7, 8);
          cameraRef.current.fov = 75;
          cameraRef.current.updateProjectionMatrix();
          controlsRef.current.target.set(0, 1.7, 0);
          controlsRef.current.minDistance = 1;
          controlsRef.current.maxPolarAngle = Math.PI;
          controlsRef.current.update();
        }
        break;
      case "exterior":
        if (cameraRef.current && controlsRef.current) {
          cameraRef.current.position.set(40, 20, 40);
          controlsRef.current.target.set(0, 5, 0);
          controlsRef.current.update();
        }
        break;
      case "xray":
        // Add x-ray view logic here if needed
        break;
    }
  }, [viewMode]);

  // Handle room navigation
  const navigateToRoom = (roomKey: RoomKey) => {
    if (!cameraRef.current || !controlsRef.current || !houseRef.current) return;

    const room = roomPositions[roomKey];

    // Set active room
    setActiveRoom(roomKey);

    // Update view mode to interior
    setViewMode("interior");

    // Move camera to room position
    const targetPosition = room.position.clone();
    const lookAtPosition = room.target.clone();

    // Smoothly animate camera position
    const startPosition = cameraRef.current.position.clone();
    const startTarget = controlsRef.current.target.clone();

    const duration = 1000; // 1 second
    const startTime = Date.now();

    const animateCamera = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease function (cubic)
      const ease = progress * progress * (3 - 2 * progress);

      // Update camera position
      cameraRef.current!.position.lerpVectors(
        startPosition,
        targetPosition,
        ease
      );
      controlsRef.current!.target.lerpVectors(
        startTarget,
        lookAtPosition,
        ease
      );
      controlsRef.current!.update();

      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      }
    };

    animateCamera();
  };

  // Add room light toggle function
  const toggleRoomLight = (roomKey: string) => {
    setRoomLights((prev) => ({
      ...prev,
      [roomKey]: !prev[roomKey],
    }));
  };

  // Update useEffect to handle room lights
  useEffect(() => {
    if (!houseRef.current) return;

    // Update room lights based on state
    Object.entries(roomLights).forEach(([room, isOn]) => {
      const light = houseRef.current?.children.find(
        (child) =>
          child instanceof THREE.PointLight && child.userData.room === room
      ) as THREE.PointLight | undefined;

      if (light) {
        light.intensity = isOn ? 1 : 0;
      }
    });
  }, [roomLights]);

  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current) return;

    const scene = sceneRef.current;

    // Update environment lighting based on time of day
    const ambientLight = scene.children.find(
      (child) => child instanceof THREE.AmbientLight
    ) as THREE.AmbientLight | undefined;

    const directionalLight = scene.children.find(
      (child) => child instanceof THREE.DirectionalLight
    ) as THREE.DirectionalLight | undefined;

    // Update room lights
    const roomLightsList = scene.children.filter(
      (child) => child instanceof THREE.PointLight
    ) as THREE.PointLight[];

    if (isDayTime) {
      // Day time settings
      if (ambientLight) ambientLight.intensity = 1;
      if (directionalLight) directionalLight.intensity = 1;
      scene.background = new THREE.Color(0x87ceeb); // Sky blue

      // Dim indoor lights during day
      roomLightsList.forEach((light) => {
        light.intensity = 0.5;
      });
    } else {
      // Night time settings
      if (ambientLight) ambientLight.intensity = 0.2;
      if (directionalLight) directionalLight.intensity = 0.1;
      scene.background = new THREE.Color(0x1a1a2a); // Dark blue night sky

      // Brighten indoor lights at night
      roomLightsList.forEach((light) => {
        light.intensity = 1;
      });
    }
  }, [isDayTime]);

  return (
    <div className="relative h-screen w-screen bg-gray-900">
      {/* 3D Viewer */}
      <div ref={mountRef} className="absolute inset-0">
        {sceneRef.current && rendererRef.current && (
          <Environment
            scene={sceneRef.current}
            renderer={rendererRef.current}
            isDayTime={isDayTime}
          />
        )}
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-x-0 bottom-6 flex justify-center items-center gap-4 pointer-events-none">
        <div className="bg-black/50 backdrop-blur-md rounded-2xl p-4 pointer-events-auto">
          <div className="flex items-center gap-4">
            {/* Quick Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setViewMode("exterior");
                  setActiveRoom(null);
                }}
                className={`p-3 rounded-xl transition-colors flex items-center gap-2 ${
                  viewMode === "exterior"
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                <span className="text-xl">🏠</span>
                <span>Exterior</span>
              </button>
              <button
                onClick={() => setIsDayTime(!isDayTime)}
                className={`p-3 rounded-xl transition-colors flex items-center gap-2 ${
                  isDayTime
                    ? "bg-yellow-500 text-white"
                    : "bg-blue-900 text-white"
                }`}
              >
                <span className="text-xl">{isDayTime ? "☀️" : "🌙"}</span>
                <span>{isDayTime ? "Day" : "Night"}</span>
              </button>
            </div>

            {/* Floor Selection */}
            <div className="h-8 w-px bg-white/20" />
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveFloor(1);
                  setActiveRoom(null);
                }}
                className={`p-3 rounded-xl transition-colors ${
                  activeFloor === 1
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                1st Floor
              </button>
              <button
                onClick={() => {
                  setActiveFloor(2);
                  setActiveRoom(null);
                }}
                className={`p-3 rounded-xl transition-colors ${
                  activeFloor === 2
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                2nd Floor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Room Quick Access - Enhanced with better bedroom visibility */}
      <div className="absolute left-1/2 top-6 -translate-x-1/2 bg-black/50 backdrop-blur-md rounded-2xl p-2 pointer-events-auto">
        <div className="flex items-center gap-2">
          {Object.entries(rooms)
            .filter(([, data]) => data.floor === activeFloor)
            .map(([key, room]) => (
              <button
                key={key}
                onClick={() => navigateToRoom(key as RoomKey)}
                className={`p-3 rounded-xl transition-colors flex flex-col items-center gap-1 min-w-[80px] ${
                  activeRoom === key
                    ? "bg-blue-500 text-white"
                    : room.name.toLowerCase().includes("bedroom")
                    ? "bg-indigo-400/20 text-white/90 hover:bg-indigo-400/30"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                <span className="text-2xl">{room.icon}</span>
                <span className="text-xs font-medium whitespace-nowrap">
                  {room.name}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    roomLights[key] ? "bg-yellow-400" : "bg-gray-600"
                  }`}
                />
              </button>
            ))}
        </div>
      </div>

      {/* Room Info Panel - Enhanced with day/night info */}
      {activeRoom && (
        <div className="absolute top-24 right-6 bg-black/50 backdrop-blur-md p-6 rounded-2xl text-white pointer-events-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {rooms[activeRoom as keyof typeof rooms]?.name}
            </h3>
            <button
              onClick={() => toggleRoomLight(activeRoom)}
              className={`p-3 rounded-xl transition-colors ${
                roomLights[activeRoom]
                  ? "bg-yellow-400 text-white"
                  : "bg-gray-600 text-white/80"
              }`}
            >
              {roomLights[activeRoom] ? "💡 On" : "⚫ Off"}
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/80">Temperature</span>
              <span className="font-medium">
                {rooms[activeRoom as keyof typeof rooms]?.temperature}°C
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">Humidity</span>
              <span className="font-medium">
                {rooms[activeRoom as keyof typeof rooms]?.humidity}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">Light Level</span>
              <span className="font-medium">
                {isDayTime ? "Natural Light" : "Artificial Light"} (
                {rooms[activeRoom as keyof typeof rooms]?.lightLevel}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">Time of Day</span>
              <span className="font-medium">
                {isDayTime ? "☀️ Day" : "🌙 Night"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-white text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium">Loading Smart Home...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseViewer;
