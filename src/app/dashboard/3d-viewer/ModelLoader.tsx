"use client";
import { useEffect, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import * as THREE from "three";

interface ModelLoaderProps {
  scene: THREE.Scene;
  onLoad?: (model: THREE.Group) => void;
  modelPath: string;
}

export const ModelLoader = ({ scene, onLoad, modelPath }: ModelLoaderProps) => {
  const modelRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    loader.setDRACOLoader(dracoLoader);

    // Create an empty group to hold the model
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelRef.current = modelGroup;

    loader.load(
      modelPath,
      (gltf) => {
        if (modelRef.current) {
          scene.remove(modelRef.current);
        }

        const model = gltf.scene;
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Enable material features for PBR
            if (child.material) {
              child.material.envMapIntensity = 1;
              child.material.needsUpdate = true;
            }
          }
        });

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        model.position.sub(center);
        const scale = 1 / Math.max(size.x, size.y, size.z);
        model.scale.multiplyScalar(scale);

        scene.add(model);
        modelRef.current = model;

        if (onLoad) {
          onLoad(model);
        }
      },
      (progress) => {
        console.log(
          "Loading progress:",
          (progress.loaded / progress.total) * 100,
          "%"
        );
      },
      (error) => {
        console.error("Error loading model:", error);
        // Create an empty group if model loading fails
        const emptyModel = new THREE.Group();
        scene.add(emptyModel);
        if (onLoad) {
          onLoad(emptyModel);
        }
      }
    );

    return () => {
      if (modelRef.current) {
        scene.remove(modelRef.current);
      }
      dracoLoader.dispose();
    };
  }, [scene, modelPath, onLoad]);

  return null;
};
