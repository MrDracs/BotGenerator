import React, { useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Avatar = () => {
  useEffect(() => {
    // Create the scene
    const scene = new THREE.Scene();
    
    // Set up the camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 3);  // Position to focus on upper half

    // Create the renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Load the avatar GLB model
    const loader = new GLTFLoader();
    loader.load(`${process.env.PUBLIC_URL}/models/girl.glb`, (gltf) => {
      const avatar = gltf.scene;

      // Traverse the scene and apply modifications
      avatar.traverse((child) => {
        if (child.isMesh) {
          // Only display upper half by moving or clipping the lower part of the model
          child.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 1.5, 0));  // Adjust Y axis
        }
      });

      scene.add(avatar);
    }, undefined, (error) => {
      console.error('An error occurred while loading the model:', error);
    });

    // Set the lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    // Animation loop
    const animate = function () {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup on component unmount
    return () => {
      document.body.removeChild(renderer.domElement);
    };
  }, []);

  return null;
};

export default Avatar;
