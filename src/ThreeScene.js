import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import path from './models/car.glb';
import texturePath from './texture/green.png';

const ThreeScene = () => {
    const mountRef = useRef(null);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let model;

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
            model = gltf.scene;
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material.map = texture;  // Apply the texture
                    child.material.metalness = 0.1;  // Reduce metalness
                    child.material.roughness = 0.5;  // Adjust roughness
                    child.material.transparent = true; // Enable transparency
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

        // Handle mouse move
        const onMouseMove = (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects(scene.children, true);
            if (intersects.length > 0) {
                const hoveredObject = intersects[0].object;
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.material.opacity = (child === hoveredObject) ? 1 : 0.3;
                    }
                });
            } else if (model) {
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.material.opacity = 1;
                    }
                });
            }
        };

        window.addEventListener('mousemove', onMouseMove);

        // Cleanup function
        return () => {
            mountRef.current.removeChild(renderer.domElement);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default ThreeScene;
