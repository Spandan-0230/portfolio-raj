"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// ============================================================================
// ROBOT 3D VIEWER CONFIGURATION
// Fine-tune positioning, head tracking range, scale, and lighting with single numbers
// ============================================================================
export const ROBOT_CONFIG = {
  // 1. Orientation & Rotation:
  //    Base rotation around Y axis in degrees (-90 = turns model to face front towards camera)
  rotationYDeg: -90,

  // 2. Positioning & Fitting within the Left Block:
  //    Base scale multiplier (1.0 = automatic fit to box)
  scale: 1.0,
  //    Vertical offset: positive moves model UP, negative moves DOWN (in 3D units)
  yOffset: 0.0,
  //    Horizontal offset: positive moves model RIGHT, negative moves LEFT (in 3D units)
  xOffset: 0.0,
  //    Padding ratio around the model bounds (1.15 = 15% breathing room inside block)
  fitPadding: 1.80,

  // 3. Camera Field of View (in degrees):
  cameraFov: 42,

  // 4. Head Tracking Sensitivity:
  //    Max horizontal head turn in radians (0.65 rad ≈ 37 degrees)
  maxYawRad: 0.40,
  //    Max vertical head nod in radians (0.35 rad ≈ 20 degrees)
  maxPitchRad: 0.4,
  //    Smooth interpolation / damping speed (0.05 = butter smooth/floaty, 0.12 = snappy)
  smoothDamping: 0.1,

  // 5. Tracking Direction Inversion:
  //    invertYaw: false = cursor moves right -> robot turns head right
  invertYaw: false,
  //    invertPitch: false = cursor moves up -> robot tilts head up
  invertPitch: false,

  // 6. Lighting Intensities:
  ambientIntensity: 1.5,
  keyLightIntensity: 2.4,
  fillLightIntensity: 1.0,
  rimLightIntensity: 2.8,
  glowLightIntensity: 1.2,
};

export default function RobotViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      ROBOT_CONFIG.cameraFov,
      container.clientWidth / (container.clientHeight || 1),
      0.1,
      100
    );

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // 2. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, ROBOT_CONFIG.ambientIntensity);
    scene.add(ambientLight);

    // Key Light (top-front-right)
    const keyLight = new THREE.DirectionalLight(0xffffff, ROBOT_CONFIG.keyLightIntensity);
    keyLight.position.set(3, 4, 4);
    scene.add(keyLight);

    // Fill Light (front-left, soft cool tint)
    const fillLight = new THREE.DirectionalLight(0x88bbff, ROBOT_CONFIG.fillLightIntensity);
    fillLight.position.set(-3, 1, 2);
    scene.add(fillLight);

    // Rim / Backlight (high behind model to outline metallic silhouette against dark glass)
    const rimLight = new THREE.DirectionalLight(0xffffff, ROBOT_CONFIG.rimLightIntensity);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // Accent Point Glow (subtle cybernetic glow)
    const pointLight = new THREE.PointLight(0x00d2ff, ROBOT_CONFIG.glowLightIntensity, 8);
    pointLight.position.set(0, 1.2, 2.5);
    scene.add(pointLight);

    // 3. Model Hierarchy & State
    const modelPivot = new THREE.Group();
    scene.add(modelPivot);

    let headBone: THREE.Bone | null = null;
    const initialHeadQuat = new THREE.Quaternion();
    const targetLook = { x: 0, y: 0 };
    const currentLook = { x: 0, y: 0 };
    let modelBounds = { size: new THREE.Vector3(1, 1, 1), center: new THREE.Vector3(0, 0, 0) };
    let hasLoadedModel = false;

    // 4. Fit Camera to Model Bounds
    const fitCamera = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      const aspect = width / height;
      camera.aspect = aspect;

      const vFov = (camera.fov * Math.PI) / 180;
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);

      const { size } = modelBounds;
      const distY = size.y / 2 / Math.tan(vFov / 2);
      const distX = size.x / 2 / Math.tan(hFov / 2);
      const fitDistance = Math.max(distY, distX) * ROBOT_CONFIG.fitPadding;

      camera.position.set(0, 0, fitDistance);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    // 5. Load GLTF with Draco Compression
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/gltf/");

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load(
      "/3d_models/Robot_boned.glb",
      (gltf) => {
        const root = gltf.scene;

        // 1. Orient model to face front towards camera
        root.rotation.y = THREE.MathUtils.degToRad(ROBOT_CONFIG.rotationYDeg);
        root.updateMatrixWorld(true);

        // 2. Calculate model bounding box for auto-centering
        const box = new THREE.Box3().setFromObject(root);
        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = new THREE.Vector3();
        box.getSize(size);
        modelBounds = { size, center };

        // 3. Center the model geometry inside modelPivot
        root.position.x = -center.x + ROBOT_CONFIG.xOffset;
        root.position.y = -center.y + ROBOT_CONFIG.yOffset;
        root.position.z = -center.z;
        modelPivot.scale.setScalar(ROBOT_CONFIG.scale);
        modelPivot.add(root);

        // Find Head bone
        root.traverse((child) => {
          if ((child as THREE.Bone).isBone && child.name.toLowerCase() === "head") {
            headBone = child as THREE.Bone;
            initialHeadQuat.copy(headBone.quaternion);
          }
        });

        hasLoadedModel = true;
        fitCamera();
        setIsLoaded(true);
      },
      undefined,
      (error) => {
        console.error("Failed to load Robot_boned.glb:", error);
      }
    );

    // 6. Responsive Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      fitCamera();
    });
    resizeObserver.observe(container);

    // 7. Mouse / Cursor & Touch Tracking
    const onPointerMove = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Coordinate relative to robot center, normalized across screen
      const relX = (e.clientX - centerX) / (window.innerWidth / 2);
      const relY = (e.clientY - centerY) / (window.innerHeight / 2);

      // Clamp between -1.5 and 1.5 to allow comfortable glance without over-rotation
      targetLook.x = Math.max(-1.5, Math.min(1.5, relX));
      targetLook.y = Math.max(-1.5, Math.min(1.5, relY));
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!container || !e.touches[0]) return;
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const relX = (touch.clientX - centerX) / (window.innerWidth / 2);
      const relY = (touch.clientY - centerY) / (window.innerHeight / 2);

      targetLook.x = Math.max(-1.5, Math.min(1.5, relX));
      targetLook.y = Math.max(-1.5, Math.min(1.5, relY));
    };

    const onMouseLeave = () => {
      // Smoothly look back forward when cursor leaves viewport
      targetLook.x = 0;
      targetLook.y = 0;
    };

    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onMouseLeave);

    // 8. 60fps Smooth Animation Loop with Damped Rotation
    let rafId: number;
    const deltaQuat = new THREE.Quaternion();
    const euler = new THREE.Euler(0, 0, 0, "YXZ");

    const animate = () => {
      rafId = requestAnimationFrame(animate);

      // Smooth damping towards cursor target
      currentLook.x += (targetLook.x - currentLook.x) * ROBOT_CONFIG.smoothDamping;
      currentLook.y += (targetLook.y - currentLook.y) * ROBOT_CONFIG.smoothDamping;

      if (headBone && hasLoadedModel) {
        // Yaw (look left/right): rotation around local Y axis
        const yaw = (ROBOT_CONFIG.invertYaw ? -1 : 1) * currentLook.x * ROBOT_CONFIG.maxYawRad;

        // Pitch (look up/down): rotation around local Z axis
        // Cursor down -> head tilts down; Cursor up -> head tilts up
        const pitch = (ROBOT_CONFIG.invertPitch ? 1 : -1) * currentLook.y * ROBOT_CONFIG.maxPitchRad;

        euler.set(0, yaw, pitch, "YZX");
        deltaQuat.setFromEuler(euler);

        // Apply delta rotation to initial bind quaternion
        headBone.quaternion.copy(initialHeadQuat).multiply(deltaQuat);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup & Memory Disposal
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      resizeObserver.disconnect();

      dracoLoader.dispose();

      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => mat.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="robot-viewer-container"
      style={{
        opacity: isLoaded ? 1 : 0,
        transition: "opacity 0.6s ease-out",
      }}
    >
      <style jsx>{`
        .robot-viewer-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          user-select: none;
          overflow: hidden;
        }

        :global(.robot-viewer-container canvas) {
          width: 100% !important;
          height: 100% !important;
          display: block;
          outline: none;
        }
      `}</style>
    </div>
  );
}
