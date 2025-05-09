import React from "react";
import * as THREE from "three";
import { useRef } from "react";

interface PlaceholderHomeProps {
  selectedRoom: string;
}

interface RoomStructure {
  geometry: THREE.BoxGeometry;
  material: THREE.MeshStandardMaterial;
  position: [number, number, number];
  name?: string;
}

interface Structure {
  [key: string]: RoomStructure;
}

export function PlaceholderHome({ selectedRoom }: PlaceholderHomeProps) {
  const modelRef = useRef<THREE.Group>(null);

  // Create a simple house structure
  const structure: Structure = {
    walls: {
      geometry: new THREE.BoxGeometry(10, 5, 8),
      material: new THREE.MeshStandardMaterial({ color: 0xcccccc }),
      position: [0, 2.5, 0],
    },
    roof: {
      geometry: new THREE.BoxGeometry(11, 2, 9),
      material: new THREE.MeshStandardMaterial({ color: 0x8b4513 }),
      position: [0, 6, 0],
    },
    livingRoom: {
      geometry: new THREE.BoxGeometry(4, 0.1, 4),
      material: new THREE.MeshStandardMaterial({ color: 0xf5f5dc }),
      position: [2, 0.1, 2],
      name: "livingRoom",
    },
    kitchen: {
      geometry: new THREE.BoxGeometry(4, 0.1, 4),
      material: new THREE.MeshStandardMaterial({ color: 0xffffff }),
      position: [-2, 0.1, 2],
      name: "kitchen",
    },
    bedroom: {
      geometry: new THREE.BoxGeometry(4, 0.1, 4),
      material: new THREE.MeshStandardMaterial({ color: 0xe6e6fa }),
      position: [2, 0.1, -2],
      name: "bedroom",
    },
    bathroom: {
      geometry: new THREE.BoxGeometry(4, 0.1, 4),
      material: new THREE.MeshStandardMaterial({ color: 0xadd8e6 }),
      position: [-2, 0.1, -2],
      name: "bathroom",
    },
  };

  // Highlight selected room
  if (selectedRoom && structure[selectedRoom]) {
    structure[selectedRoom].material = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.2,
    });
  }

  return (
    <group ref={modelRef}>
      {Object.entries(structure).map(([key, props]) => (
        <mesh
          key={key}
          geometry={props.geometry}
          material={props.material}
          position={new THREE.Vector3(...props.position)}
          name={props.name || key}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}
