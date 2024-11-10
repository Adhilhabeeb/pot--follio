import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import * as THREE from 'three';
import spline from './assets/spline';

function Canvas() {
  const divel = useRef();
  const [scrollPosition, setScrollPosition] = useState(0);  // Track scroll position in state

useEffect(() => {
    const boxgeii = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.6, 0.6),
      new THREE.MeshBasicMaterial({ color: "red" })
    );
    boxgeii.name="theredbox"
    const scene = new THREE.Scene();

    // Tube Geometry (visualizing spline path as a wireframe tube)
    const tubeGeo = new THREE.TubeGeometry(spline, 50, 0.5, 16, false);
    const tubeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMaterial);
    scene.add(tubeMesh);  // Add tubeMesh first
    scene.add(boxgeii);   // Add boxgeii later, potentially hidden at first
    scene.fog = new THREE.FogExp2(0x000000, 0.1);

    const w = window.innerWidth;
    const h = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(w, h);
    divel.current && divel.current.appendChild(renderer.domElement);

    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xff0000, 3);
    scene.add(ambientLight);

    // Add cylinders along the spline
    const numCylinders = 7;
    const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    for (let i = 0; i < numCylinders; i++) {
      const position = spline.getPointAt(i / numCylinders);
      const cylinder = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.2, 0.2),
        cylinderMaterial
      );
      cylinder.position.copy(position);
      scene.add(cylinder);
    }

    // Variable to track if the camera should stop
    let stopCamera = false;

    function updateCamera(t) {
      const looptime = 20 * 1000;
      const p = (t % looptime) / looptime;

      const pos = tubeGeo.parameters.path.getPointAt(p);
      const lookAt = tubeGeo.parameters.path.getPointAt((p + 0.03) % 1);

      boxgeii.position.x = tubeGeo.parameters.path.getPointAt(1).x + 0.26855774212986034;
      boxgeii.position.y = tubeGeo.parameters.path.getPointAt(1).y + 0.16855774212986034;
      boxgeii.position.z = -0.56855774212986034;

      if (p >= 0.8) {
        camera.position.copy(tubeGeo.parameters.path.getPointAt(0.9));
        camera.lookAt(boxgeii.position);
        stopCamera = true;
      } else {
        camera.position.copy(pos);
        camera.lookAt(lookAt);
      }
    }

    // Handle window resizing
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    // Scroll event to control camera position
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset; // Get the scroll position
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight; // Max scrollable height

      // Normalize scroll position to a value between 0 and 1
      const normalizedScroll = scrollY / scrollMax;
console.log(normalizedScroll,"console.log")
      // Set scroll position in state
      setScrollPosition(normalizedScroll);

      // Update camera position based on scroll
      updateCamera(normalizedScroll * 20 * 1000);  // Adjust multiplier based on how fast you want the camera to move

      // Show the boxgeii as the scroll progresses
      if (normalizedScroll > 0.0000001) { // Threshold for boxgeii to appear
        boxgeii.visible = true;  // Make the boxgeii visible
console.log(scene.children,"chillldd")

      } else {
        boxgeii.visible = false; // Hide boxgeii initially
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    animate();

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return <div className='canvasdiv' ref={divel}></div>;
}

export default Canvas;
