"use client";
import { useEffect } from "react";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

interface EnvironmentProps {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  isDayTime?: boolean;
}

export const Environment = ({
  scene,
  renderer,
  isDayTime = true,
}: EnvironmentProps) => {
  useEffect(() => {
    // Setup environment map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    new RGBELoader()
      .setPath("/environments/")
      .load(isDayTime ? "day.hdr" : "night.hdr", (texture) => {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        scene.environment = envMap;
        scene.background = new THREE.Color(isDayTime ? 0x88ccff : 0x002244);

        texture.dispose();
        pmremGenerator.dispose();
      });

    // Setup lighting
    const setupLighting = () => {
      // Clear existing lights
      scene.children = scene.children.filter(
        (child) => !(child instanceof THREE.Light)
      );

      if (isDayTime) {
        // Ambient light
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambient);

        // Sun
        const sun = new THREE.DirectionalLight(0xffffff, 1);
        sun.position.set(10, 20, 10);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 50;
        sun.shadow.camera.left = -20;
        sun.shadow.camera.right = 20;
        sun.shadow.camera.top = 20;
        sun.shadow.camera.bottom = -20;
        scene.add(sun);

        // Hemisphere light for sky color
        const hemi = new THREE.HemisphereLight(0x88ccff, 0x444444, 0.6);
        scene.add(hemi);
      } else {
        // Night ambient
        const ambient = new THREE.AmbientLight(0x002244, 0.3);
        scene.add(ambient);

        // Moon
        const moon = new THREE.DirectionalLight(0x8888ff, 0.5);
        moon.position.set(-10, 20, -10);
        moon.castShadow = true;
        moon.shadow.mapSize.width = 2048;
        moon.shadow.mapSize.height = 2048;
        scene.add(moon);

        // Add some accent lights
        const createSpotlight = (
          color: number,
          intensity: number,
          position: THREE.Vector3
        ) => {
          const light = new THREE.SpotLight(
            color,
            intensity,
            20,
            Math.PI / 4,
            0.5
          );
          light.position.copy(position);
          light.castShadow = true;
          return light;
        };

        const spots = [
          createSpotlight(0xffaa44, 1, new THREE.Vector3(5, 5, 5)),
          createSpotlight(0x4477ff, 1, new THREE.Vector3(-5, 5, -5)),
          createSpotlight(0xff4422, 1, new THREE.Vector3(-5, 5, 5)),
        ];

        spots.forEach((spot) => scene.add(spot));
      }
    };

    setupLighting();

    return () => {
      scene.environment = null;
      scene.background = new THREE.Color(0x000000);
    };
  }, [scene, renderer, isDayTime]);

  return null;
};
