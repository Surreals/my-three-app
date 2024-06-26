import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import path from './models/car.glb';
import texturePath from './texture/green.png';

const ThreeScene = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        // Create scene, camera, and renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setClearColor(0xffffff); // Set background color to white
        mountRef.current.appendChild(renderer.domElement);

        // Add ambient and directional light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 10, 5);
        scene.add(directionalLight);

        // Load GLTF model and apply texture
        const loader = new GLTFLoader();
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(texturePath);

        loader.load(path, (gltf) => {
            const model = gltf.scene;
            model.traverse((child) => {
                console.log(child)
                if (child.isMesh) {
                    child.material.map = texture;  // Apply the texture
                    child.material.metalness = 0.1;  // Reduce metalness
                    child.material.roughness = 0.5;  // Adjust roughness
                }
            });
            scene.add(model);
        }, undefined, (error) => {
            console.error(error);
        });

        // Set camera position
        camera.position.set(-10, 0, 0);

        // OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Handle window resize
        const handleResize = () => {
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
            mountRef.current.removeChild(renderer.domElement);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default ThreeScene;
