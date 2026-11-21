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
  rotationYDeg: -120,

  // 2. Positioning & Fitting within the Left Block:
  //    Base scale multiplier (1.0 = automatic fit to box)
  scale: 1.0,
  //    Vertical offset: positive moves model UP, negative moves DOWN (in 3D units)
  yOffset: -0.15,
  //    Horizontal offset: positive moves model RIGHT, negative moves LEFT (in 3D units)
  xOffset: -0.06,
  //    Padding ratio around the model bounds (1.70 = comfortable framing inside block)
  fitPadding: 1.70,

  // 3. Camera Field of View (in degrees):
  cameraFov: 80,

  // 4. Head Tracking Sensitivity:
  //    Max horizontal head turn in radians (0.40 rad ≈ 23 degrees)
  maxYawRad: 0.40,
  //    Max vertical head nod in radians (0.40 rad ≈ 23 degrees)
  maxPitchRad: 0.40,
  //    Smooth interpolation / damping speed
  smoothDamping: 0.50,

  // 5. Tracking Direction Inversion:
  //    invertYaw: false = cursor moves right -> robot turns head right
  invertYaw: false,
  //    invertPitch: false = cursor moves up -> robot tilts head up
  invertPitch: false,

  // 6. Free Form / Idle Animation Sequence Controls:
  //    Inactivity timeout in ms before idle animation activates
  idleTimeoutMs: 1500,
  //    Full duration of the complete idle loop (seconds)
  idleCycleDurationSec: 10,
  //    Forward swing angle for straight forward leg movement (rad, ~32-34 deg as in Blender)
  idleLegStepRad: 0.55,
  //    Backward swing angle for the hands/arms when looking down (radians)
  idleArmSwingRad: 0.22,
  //    Downward nod angle when inspecting legs (radians)
  idleLookDownRad: 0.50,
  //    Upward nod angle when looking Northwest and Northeast (radians)
  idleLookUpRad: 0.24,
  //    Head shoulder nod/tilt angle (radians)
  idleShoulderTiltRad: 0.18,
  //    Reactive arm swing strength during active mouse tracking
  mouseArmReaction: 0.22,

  // 7. Lighting Intensities:
  ambientIntensity: 1.5,
  keyLightIntensity: 2.4,
  fillLightIntensity: 1.0,
  rimLightIntensity: 2.8,
  glowLightIntensity: 1.2,

  // 8. Ground Contact Shadow Configuration:
  shadowOpacity: 0.82,  // Ground shadow darkness (0.0 = off, 1.0 = deep dark contact)
  shadowWidth: 1.15,    // Horizontal spread of the shadow disc (3D units)
  shadowDepth: 0.85,    // Depth spread of the shadow disc (3D units)
  shadowYOffset: 0.002, // Vertical offset flush against soles
};

// Procedural multi-stage contact shadow texture generator
function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = 256;
  const cy = 256;

  ctx.clearRect(0, 0, 512, 512);

  // 1. Broad soft ambient occlusion under the entire body
  const ambientGrad = ctx.createRadialGradient(cx, cy, 15, cx, cy, 215);
  ambientGrad.addColorStop(0, "rgba(0, 0, 0, 0.72)");
  ambientGrad.addColorStop(0.35, "rgba(0, 0, 0, 0.48)");
  ambientGrad.addColorStop(0.68, "rgba(0, 0, 0, 0.18)");
  ambientGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1.0, 0.62); // Squash ellipse to match floor perspective
  ctx.beginPath();
  ctx.arc(0, 0, 205, 0, Math.PI * 2);
  ctx.fillStyle = ambientGrad;
  ctx.fill();
  ctx.restore();

  // 2. Direct contact occlusion spots under each foot (dense black contact with soft edges)
  const drawFootContact = (fx: number, fy: number) => {
    if (!ctx) return;
    const footGrad = ctx.createRadialGradient(fx, fy, 4, fx, fy, 80);
    footGrad.addColorStop(0, "rgba(0, 0, 0, 0.96)");
    footGrad.addColorStop(0.35, "rgba(0, 0, 0, 0.75)");
    footGrad.addColorStop(0.70, "rgba(0, 0, 0, 0.28)");
    footGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.save();
    ctx.translate(fx, fy);
    ctx.scale(1.0, 0.58);
    ctx.beginPath();
    ctx.arc(0, 0, 80, 0, Math.PI * 2);
    ctx.fillStyle = footGrad;
    ctx.fill();
    ctx.restore();
  };

  // Foot contact spots located at X = ±80px (matching ±0.18 units in 3D)
  drawFootContact(cx - 80, cy + 10);
  drawFootContact(cx + 80, cy + 10);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

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

    // 3. Model Hierarchy & Bone References
    const modelPivot = new THREE.Group();
    scene.add(modelPivot);

    // Ground Contact Shadow Mesh
    const shadowTexture = createContactShadowTexture();
    const shadowGeo = new THREE.PlaneGeometry(1, 1);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: ROBOT_CONFIG.shadowOpacity,
      depthWrite: false,
      toneMapped: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.visible = false;
    scene.add(shadowMesh);

    let headBone: THREE.Bone | null = null;
    let legLeftBone: THREE.Bone | null = null;
    let legRightBone: THREE.Bone | null = null;
    let armLeftBone: THREE.Bone | null = null;
    let armRightBone: THREE.Bone | null = null;

    const initialHeadQuat = new THREE.Quaternion();
    const initialLegLeftQuat = new THREE.Quaternion();
    const initialLegRightQuat = new THREE.Quaternion();
    const initialArmLeftQuat = new THREE.Quaternion();
    const initialArmRightQuat = new THREE.Quaternion();

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

        // 4. Locate and bind all bones for head, whole legs, and arms
        root.traverse((child) => {
          if ((child as THREE.Bone).isBone) {
            const bone = child as THREE.Bone;
            const lower = bone.name.toLowerCase();
            if (lower === "head") {
              headBone = bone;
              initialHeadQuat.copy(bone.quaternion);
            } else if (lower === "hip_to_knee_l") {
              legLeftBone = bone;
              initialLegLeftQuat.copy(bone.quaternion);
            } else if (lower === "hip_to_knee_r") {
              legRightBone = bone;
              initialLegRightQuat.copy(bone.quaternion);
            } else if (lower === "hand_near_shoulder_l") {
              armLeftBone = bone;
              initialArmLeftQuat.copy(bone.quaternion);
            } else if (lower === "hand_near_shoulder_r") {
              armRightBone = bone;
              initialArmRightQuat.copy(bone.quaternion);
            }
          }
        });

        hasLoadedModel = true;
        // 5. Position realistic ground contact shadow & white specular reflection planes directly at feet level
        const feetY = -center.y + ROBOT_CONFIG.yOffset;
        shadowMesh.position.set(
          ROBOT_CONFIG.xOffset,
          feetY + ROBOT_CONFIG.shadowYOffset,
          0.02
        );
        shadowMesh.scale.set(ROBOT_CONFIG.shadowWidth, ROBOT_CONFIG.shadowDepth, 1);
        shadowMesh.visible = true;

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

    // 7. Mouse / Cursor & Touch Tracking with Inactivity Timer
    let lastUserActivity = performance.now();
    let isHovering = false;
    let idleWeight = 1.0; // Starts in idle mode if cursor is untouched
    let idleCycleTime = 0;
    let lastFrameTime = performance.now();

    const onPointerMove = (e: MouseEvent) => {
      if (!container) return;
      lastUserActivity = performance.now();
      isHovering = true;

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
      lastUserActivity = performance.now();
      isHovering = true;

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
      isHovering = false;
      targetLook.x = 0;
      targetLook.y = 0;
    };

    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onMouseLeave);

    // 8. 60fps Animation Loop: Smooth Interactive Tracking & Idle Choreography
    let rafId: number;
    const deltaHeadQuat = new THREE.Quaternion();
    const deltaLegLQuat = new THREE.Quaternion();
    const deltaLegRQuat = new THREE.Quaternion();
    const deltaArmLQuat = new THREE.Quaternion();
    const deltaArmRQuat = new THREE.Quaternion();
    const headEuler = new THREE.Euler(0, 0, 0, "YZX");
    const armEuler = new THREE.Euler(0, 0, 0, "XYZ");

    const smooth = (p: number) => {
      const c = Math.max(0, Math.min(1, p));
      return c * c * (3 - 2 * c);
    };

    const animate = () => {
      rafId = requestAnimationFrame(animate);

      const now = performance.now();
      const deltaSec = Math.min((now - lastFrameTime) / 1000, 0.1);
      lastFrameTime = now;

      // Smooth damping towards cursor target
      currentLook.x += (targetLook.x - currentLook.x) * ROBOT_CONFIG.smoothDamping;
      currentLook.y += (targetLook.y - currentLook.y) * ROBOT_CONFIG.smoothDamping;

      // Check if robot is in free form / idle mode
      const isIdle = !isHovering || (now - lastUserActivity > ROBOT_CONFIG.idleTimeoutMs);
      const targetIdleWeight = isIdle ? 1.0 : 0.0;
      idleWeight += (targetIdleWeight - idleWeight) * (isIdle ? 0.03 : 0.08);

      // Advance idle loop time
      if (idleWeight > 0.001) {
        idleCycleTime += deltaSec;
      }
      const cycleDuration = ROBOT_CONFIG.idleCycleDurationSec;
      const t = (idleCycleTime % cycleDuration) / cycleDuration;

      // ======================================================================
      // IDLE CHOREOGRAPHY PHASES
      // 1. Head down to left leg + whole left leg straight forward + hands back
      // 2. Head STILL down watching right leg + whole right leg straight forward
      // 3. Both legs at default position + head STILL down
      // 4. Head moves upwards + looks Northwest then sweeps to Northeast
      // 5. Default all parts at position
      // 6. Head nodding on left and right shoulder smoothly, then on default
      // ======================================================================
      let idleYaw = 0;
      let idlePitch = 0;
      let idleRoll = 0;
      let idleLegL = 0;
      let idleLegR = 0;
      let idleArms = 0;

      if (t < 0.22) {
        // Phase 1: Head quickly looks down at left leg (arrives by p = 0.25), then left leg steps forward in sync
        const p = t / 0.22;
        const headProgress = smooth(p / 0.25);
        idleYaw = 0.26 * headProgress;
        idlePitch = -ROBOT_CONFIG.idleLookDownRad * headProgress;

        // Left leg steps forward as head is firmly locked on it (peaks at p = 0.50, finishes by p = 0.85)
        let step = 0;
        if (p >= 0.15 && p <= 0.85) {
          const u = (p - 0.15) / 0.70;
          step = Math.sin(Math.PI * u);
        }
        idleLegL = ROBOT_CONFIG.idleLegStepRad * step;
        idleArms = ROBOT_CONFIG.idleArmSwingRad * (0.4 + 0.6 * step);
      } else if (t < 0.44) {
        // Phase 2: Head promptly pans across to right leg by p = 0.25 while staying DOWN, right leg steps forward in sync
        const p = (t - 0.22) / 0.22;
        const headProgress = smooth(p / 0.25);
        idleYaw = THREE.MathUtils.lerp(0.26, -0.26, headProgress);
        idlePitch = -ROBOT_CONFIG.idleLookDownRad;

        // Right leg steps forward while head is firmly locked on it (peaks at p = 0.50, finishes by p = 0.85)
        let step = 0;
        if (p >= 0.15 && p <= 0.85) {
          const u = (p - 0.15) / 0.70;
          step = Math.sin(Math.PI * u);
        }
        idleLegR = ROBOT_CONFIG.idleLegStepRad * step;
        idleArms = ROBOT_CONFIG.idleArmSwingRad * (0.4 + 0.6 * step);
      } else if (t < 0.54) {
        // Phase 3: Both legs at default position, head STILL down gazing at feet, arms relaxing
        const p = (t - 0.44) / 0.10;
        idleYaw = THREE.MathUtils.lerp(-0.26, 0.0, smooth(p));
        idlePitch = THREE.MathUtils.lerp(-ROBOT_CONFIG.idleLookDownRad, -0.38, smooth(p));
        idleArms = THREE.MathUtils.lerp(ROBOT_CONFIG.idleArmSwingRad * 0.4, 0.0, smooth(p));
      } else if (t < 0.74) {
        // Phase 4: Head moves upwards, sees Northwest then Northeast
        const p = (t - 0.54) / 0.20;
        if (p < 0.45) {
          // Look Northwest (up & left)
          const u = smooth(p / 0.45);
          idleYaw = THREE.MathUtils.lerp(0.0, -0.32, u);
          idlePitch = THREE.MathUtils.lerp(-0.38, ROBOT_CONFIG.idleLookUpRad, u);
        } else {
          // Sweep across to Northeast (up & right)
          const u = smooth((p - 0.45) / 0.55);
          idleYaw = THREE.MathUtils.lerp(-0.32, 0.32, u);
          idlePitch = ROBOT_CONFIG.idleLookUpRad;
        }
      } else if (t < 0.84) {
        // Phase 5: Default all parts at position (center forward gaze)
        const p = (t - 0.74) / 0.10;
        const u = smooth(p);
        idleYaw = THREE.MathUtils.lerp(0.32, 0.0, u);
        idlePitch = THREE.MathUtils.lerp(ROBOT_CONFIG.idleLookUpRad, 0.0, u);
      } else {
        // Phase 6: Head nodding on left and right shoulder smoothly, then default position
        const p = (t - 0.84) / 0.16;
        const clampedP = Math.max(0, Math.min(1, p));
        idleRoll = ROBOT_CONFIG.idleShoulderTiltRad * Math.sin(Math.PI * 2 * clampedP);
      }

      // ======================================================================
      // INTERACTIVE MOUSE TRACKING WITH ARM REACTIVITY
      // When looking downwards -> both hands move back
      // When looking upwards -> hands move slightly forward
      // ======================================================================
      const userYaw = (ROBOT_CONFIG.invertYaw ? -1 : 1) * currentLook.x * ROBOT_CONFIG.maxYawRad;
      const userPitch = (ROBOT_CONFIG.invertPitch ? 1 : -1) * currentLook.y * ROBOT_CONFIG.maxPitchRad;

      // Mouse arm reaction:
      // currentLook.y > 0 (looking down) -> arms swing back (+Z)
      // currentLook.y < 0 (looking up) -> arms swing slightly forward (-Z)
      const userArms = currentLook.y > 0
        ? currentLook.y * ROBOT_CONFIG.mouseArmReaction
        : currentLook.y * (ROBOT_CONFIG.mouseArmReaction * 0.45);

      // Smoothly blend between active user tracking and idle choreography:
      const finalYaw = userYaw * (1 - idleWeight) + idleYaw * idleWeight;
      const finalPitch = userPitch * (1 - idleWeight) + idlePitch * idleWeight;
      const finalRoll = idleRoll * idleWeight;

      const finalLegL = idleLegL * idleWeight;
      const finalLegR = idleLegR * idleWeight;
      const finalArms = userArms * (1 - idleWeight) + idleArms * idleWeight;

      if (hasLoadedModel) {
        // 1. Head Bone: Yaw (turn), Pitch (nod), Roll (shoulder tilt)
        if (headBone) {
          headEuler.set(finalRoll, finalYaw, finalPitch, "YZX");
          deltaHeadQuat.setFromEuler(headEuler);
          headBone.quaternion.copy(initialHeadQuat).multiply(deltaHeadQuat);
        }

        // 2. Left Leg (Thigh/Hip - straight forward movement along world Z with zero sideways drift)
        if (legLeftBone) {
          deltaLegLQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), finalLegL);
          legLeftBone.quaternion.copy(deltaLegLQuat).multiply(initialLegLeftQuat);
        }

        // 3. Right Leg (Thigh/Hip - straight forward movement along world Z with zero sideways drift)
        if (legRightBone) {
          deltaLegRQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), finalLegR);
          legRightBone.quaternion.copy(deltaLegRQuat).multiply(initialLegRightQuat);
        }

        // 4. Left Arm (Shoulder - swings backward when looking down, slightly forward when looking up)
        if (armLeftBone) {
          armEuler.set(0, 0, finalArms);
          deltaArmLQuat.setFromEuler(armEuler);
          armLeftBone.quaternion.copy(initialArmLeftQuat).multiply(deltaArmLQuat);
        }

        // 5. Right Arm (Shoulder - swings backward when looking down, slightly forward when looking up)
        if (armRightBone) {
          armEuler.set(0, 0, finalArms);
          deltaArmRQuat.setFromEuler(armEuler);
          armRightBone.quaternion.copy(initialArmRightQuat).multiply(deltaArmRQuat);
        }

        // 6. Dynamic Ground Contact Shadow footstep response
        if (shadowMesh && shadowMesh.visible) {
          const stepOffsetZ = (finalLegL + finalLegR) * 0.05;
          shadowMesh.position.z = 0.02 + stepOffsetZ;
        }
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
          overflow: visible;
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
