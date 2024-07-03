


import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import path from './models/car.glb';
import texturePath from './texture/green.png';

const Tab3D = ({ open, setOrderData }) => {
    const [systems, setSystems] = useState([]);
    const [units, setUnits] = useState([]);
    const [activeUnit, setActiveUnit] = useState(null);
    const [xx, setX] = useState(0);
    const [yy, setY] = useState(0);
    const [zz, setZ] = useState(0);
    const mountRef = useRef(null);
    const modalRef = useRef(null);
    const iconsRef = useRef([]);
    const cameraRef = useRef(null);
    let model;



    useEffect(() => {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        cameraRef.current = camera;
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setClearColor(0xffffff);
        mountRef.current.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xcccccc, 1);
        directionalLight.position.set(0, 10, 5);
        scene.add(directionalLight);

        const loader = new GLTFLoader();
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(texturePath);

        loader.load(
            path,
            gltf => {
                model = gltf.scene;
                model.traverse(child => {
                    if (child.isMesh) {
                        child.material.map = texture;
                        child.material.metalness = 0.1;
                        child.material.roughness = 0.5;
                        child.material.transparent = true;
                    }
                });

                scene.add(model);
            },
            undefined,
            error => {
                console.error(error);
            }
        );

        camera.position.set(0, 3, -7);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;
        controls.enablePan = false;

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            mountRef.current.removeChild(renderer.domElement);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div>

            <div ref={modalRef} style={{ width: '100%', minWidth: 1080, height: 800, position: 'relative' }}>
                <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    
            </div>
        </div>
    );
};

export default Tab3D;
