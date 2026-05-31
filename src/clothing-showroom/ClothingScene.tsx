import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Environment, Float, PerspectiveCamera, Sparkles, Stars } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import FashionModel, { BASE_MODEL_PATH } from "./FashionModel";
import type { CuratedLook } from "./outfits";

gsap.registerPlugin(ScrollTrigger);

type TransitionState = {
  active: boolean;
  modelOpacity: number;
  particleScale: number;
  particleOpacity: number;
  scanY: number;
  scanOpacity: number;
};

type RotationState = {
  active: boolean;
  lastX: number;
  target: number;
  velocity: number;
};

type ClothingSceneProps = {
  selectedSet: CuratedLook | null;
  dressSignal: number;
  isDressed: boolean;
  setIsDressed: React.Dispatch<React.SetStateAction<boolean>>;
  mouseRef: React.RefObject<{ x: number; y: number }>;
  isFinaleActive: boolean;
  isReturning: boolean;
  resetSignal: number;
};

function Experience({
  selectedSet,
  dressSignal,
  isDressed,
  setIsDressed,
  mouseRef,
  isFinaleActive,
  isReturning,
  resetSignal,
}: ClothingSceneProps) {
  const { camera, gl } = useThree();
  const modelRef = useRef<THREE.Group>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const spotlightRef = useRef<THREE.SpotLight>(null);
  const fillRef = useRef<THREE.PointLight>(null);
  const warmRef = useRef<THREE.PointLight>(null);
  const stageRef = useRef<THREE.Group>(null);
  const sparkleRef = useRef<THREE.Points>(null);
  const particleRef = useRef<THREE.Group>(null);
  const scanRef = useRef<THREE.Mesh>(null);
  const transitionRef = useRef<TransitionState>({
    active: false,
    modelOpacity: 1,
    particleScale: 0.25,
    particleOpacity: 0,
    scanY: -1.65,
    scanOpacity: 0,
  });
  const rotationRef = useRef<RotationState>({
    active: false,
    lastX: 0,
    target: 0,
    velocity: 0,
  });
  const [activeModelPath, setActiveModelPath] = useState(BASE_MODEL_PATH);
  const activeModelPathRef = useRef(BASE_MODEL_PATH);
  const lastGoodModelPathRef = useRef(BASE_MODEL_PATH);
  const [, setTransitionTick] = useState(0);

  useEffect(() => {
    activeModelPathRef.current = BASE_MODEL_PATH;
    lastGoodModelPathRef.current = BASE_MODEL_PATH;
    setActiveModelPath(BASE_MODEL_PATH);
    rotationRef.current = {
      active: false,
      lastX: 0,
      target: 0,
      velocity: 0,
    };
    transitionRef.current.active = false;
    transitionRef.current.modelOpacity = 1;
    transitionRef.current.particleOpacity = 0;
    transitionRef.current.scanOpacity = 0;
    setTransitionTick((tick) => tick + 1);
  }, [resetSignal]);

  useEffect(() => {
    const canvas = gl.domElement;
    const release = () => {
      rotationRef.current.active = false;
      canvas.classList.remove("is-dragging");
    };

    window.addEventListener("pointerup", release);
    window.addEventListener("pointerleave", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointerleave", release);
    };
  }, [gl]);

  useEffect(() => {
    if (!modelRef.current || !spotlightRef.current || !fillRef.current || !warmRef.current || !ambientRef.current) return undefined;

    const ctx = gsap.context(() => {
      if (!modelRef.current || !spotlightRef.current || !fillRef.current || !warmRef.current || !ambientRef.current) return;

      camera.position.set(0, 1.28, 8.45);
      camera.lookAt(0, 0.55, 0);

      const cameraTarget = { x: 0, y: 0.54, z: 0 };
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".clothing-scroll-space",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.1,
          },
          onUpdate: () => camera.lookAt(cameraTarget.x, cameraTarget.y, cameraTarget.z),
        })
        .to(camera.position, { z: 5.75, y: 1.06, duration: 0.28, ease: "none" }, 0)
        .to(spotlightRef.current, { intensity: 9.5, angle: 0.43, duration: 0.2, ease: "none" }, 0)
        .to(modelRef.current.position, { y: 0.08, duration: 0.18, ease: "none" }, 0.14)
        .to(camera.position, { z: 4.75, y: 0.92, x: -0.08, duration: 0.24, ease: "none" }, 0.34)
        .to(cameraTarget, { y: 0.28, duration: 0.24, ease: "none" }, 0.34)
        .to(fillRef.current, { intensity: 1.2, duration: 0.22, ease: "none" }, 0.48)
        .to(camera.position, { z: 4.95, y: 0.96, x: 0.24, duration: 0.26, ease: "none" }, 0.68)
        .to(cameraTarget, { x: 0.08, y: 0.3, duration: 0.26, ease: "none" }, 0.68);

      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".clothing-finale-trigger",
            start: "top 72%",
            endTrigger: ".clothing-return-trigger",
            end: "bottom 42%",
            scrub: 1.4,
          },
          onUpdate: () => camera.lookAt(cameraTarget.x, cameraTarget.y, cameraTarget.z),
        })
        .to(modelRef.current.rotation, { y: 0, x: 0, z: 0, duration: 0.22, ease: "power2.out" }, 0)
        .to(modelRef.current.position, { y: 0.12, x: 0, z: 0, duration: 0.28, ease: "power2.out" }, 0)
        .to(spotlightRef.current, { intensity: 13, angle: 0.28, duration: 0.22, ease: "power2.out" }, 0)
        .to(fillRef.current, { intensity: 0.08, duration: 0.32, ease: "power2.out" }, 0)
        .to(warmRef.current, { intensity: 0.04, duration: 0.32, ease: "power2.out" }, 0)
        .to(ambientRef.current, { intensity: 0.08, duration: 0.32, ease: "power2.out" }, 0)
        .to(camera.position, { z: 7.35, y: 1.72, x: 0, duration: 0.74, ease: "power1.inOut" }, 0.2)
        .to(cameraTarget, { x: 0, y: 0.4, z: 0, duration: 0.74, ease: "power1.inOut" }, 0.2)
        .to(stageRef.current?.scale ?? {}, { x: 0.82, y: 0.82, z: 0.82, duration: 0.74, ease: "power1.inOut" }, 0.2)
        .to(sparkleRef.current?.material ?? {}, { opacity: 0.03, duration: 0.48, ease: "power2.out" }, 0.25);
    });

    return () => ctx.revert();
  }, [camera]);

  useEffect(() => {
    if (!modelRef.current) return;

    if (isFinaleActive) {
      rotationRef.current.active = false;
      rotationRef.current.velocity = 0;
      rotationRef.current.target = 0;
      gl.domElement.classList.remove("is-dragging");
    }
  }, [gl, isFinaleActive]);

  useEffect(() => {
    if (!isReturning) return;

    rotationRef.current.active = false;
    rotationRef.current.velocity = 0;
    gl.domElement.classList.remove("is-dragging");

    const transition = transitionRef.current;
    const tween = gsap.to(transition, {
      modelOpacity: 0,
      particleOpacity: 0,
      scanOpacity: 0,
      duration: 1.15,
      ease: "power2.inOut",
      onUpdate: () => setTransitionTick((tick) => tick + 1),
    });
    return () => {
      tween.kill();
    };
  }, [gl, isReturning]);

  useEffect(() => {
    if (!dressSignal) return undefined;
    if (!selectedSet?.modelPath) return undefined;

    setIsDressed(false);

    let cancelled = false;
    const runTransition = () => {
      const transition = transitionRef.current;
      const nextModelPath = selectedSet.modelPath;

      if (activeModelPathRef.current === nextModelPath) {
        transition.active = false;
        transition.modelOpacity = 1;
        transition.particleOpacity = 0;
        transition.scanOpacity = 0;
        setTransitionTick((tick) => tick + 1);
        setIsDressed(true);
        return;
      }

      if (cancelled || !modelRef.current) return;

      rotationRef.current.active = false;
      rotationRef.current.velocity = 0;
      gl.domElement.classList.remove("is-dragging");

      transition.active = true;
      transition.modelOpacity = 1;
      transition.particleScale = 0.25;
      transition.particleOpacity = 0;
      transition.scanY = -1.65;
      transition.scanOpacity = 0;

      gsap
        .timeline({
          defaults: { ease: "power3.inOut" },
          onUpdate: () => {
            if (!particleRef.current || !scanRef.current) return;
            particleRef.current.scale.setScalar(transition.particleScale);
            scanRef.current.position.y = transition.scanY;
            setTransitionTick((tick) => tick + 1);
          },
          onComplete: () => {
            transition.active = false;
            transition.modelOpacity = 1;
            transition.particleOpacity = 0;
            transition.scanOpacity = 0;
            setTransitionTick((tick) => tick + 1);
            setIsDressed(true);
          },
        })
        .to(transition, { modelOpacity: 0.2, duration: 0.28, ease: "power2.out" }, 0)
        .to(transition, { particleOpacity: 0.34, particleScale: 1.15, duration: 0.4, ease: "sine.out" }, 0.05)
        .call(
          () => {
            lastGoodModelPathRef.current = activeModelPathRef.current;
            activeModelPathRef.current = nextModelPath;
            setActiveModelPath(nextModelPath);
          },
          [],
          0.45,
        )
        .set(transition, { modelOpacity: 0 }, 0.46)
        .to(transition, { modelOpacity: 1, duration: 0.46, ease: "power2.out" }, 0.52)
        .to(transition, { particleOpacity: 0, particleScale: 1.65, duration: 0.42, ease: "sine.inOut" }, 0.48)
        .to(transition, { scanOpacity: 0.38, scanY: 1.55, duration: 0.64, ease: "power2.inOut" }, 0.52)
        .to(transition, { scanOpacity: 0, duration: 0.24, ease: "power2.out" }, 1.04)
        .to(modelRef.current.rotation, { y: modelRef.current.rotation.y + THREE.MathUtils.degToRad(15), duration: 0.48, ease: "power2.inOut" }, 0.74);
    };

    runTransition();
    return () => {
      cancelled = true;
    };
  }, [dressSignal, gl, selectedSet, setIsDressed]);

  useFrame((_, delta) => {
    if (!modelRef.current) return;

    const rotation = rotationRef.current;
    const dt = Math.min(delta, 0.033);

    if (isReturning) {
      rotation.active = false;
      rotation.target = 0;
      rotation.velocity = 0;
      modelRef.current.rotation.y = THREE.MathUtils.damp(modelRef.current.rotation.y, 0, 5, dt);
      return;
    }

    if (isFinaleActive) {
      rotation.active = false;
      rotation.target = 0;
      rotation.velocity = 0;
      modelRef.current.rotation.y = THREE.MathUtils.damp(modelRef.current.rotation.y, 0, 7, dt);
      modelRef.current.rotation.x = THREE.MathUtils.damp(modelRef.current.rotation.x, 0, 7, dt);
      modelRef.current.rotation.z = THREE.MathUtils.damp(modelRef.current.rotation.z, 0, 7, dt);
      return;
    }

    if (!isDressed || transitionRef.current.active) {
      rotation.active = false;
      rotation.target = 0;
      rotation.velocity = 0;
      modelRef.current.rotation.y = THREE.MathUtils.damp(modelRef.current.rotation.y, 0, 6, dt);
      return;
    }

    if (rotation.active) {
      modelRef.current.rotation.y = THREE.MathUtils.damp(modelRef.current.rotation.y, rotation.target, 18, dt);
      rotation.velocity = THREE.MathUtils.damp(rotation.velocity, 0, 4.5, dt);
      return;
    }

    if (Math.abs(rotation.velocity) > 0.0008) {
      rotation.target += rotation.velocity * dt;
      rotation.velocity *= Math.pow(0.92, dt * 60);
    } else {
      rotation.velocity = 0;
    }

    modelRef.current.rotation.y = THREE.MathUtils.damp(modelRef.current.rotation.y, rotation.target, 9, dt);
  });

  const beginDrag = (event: ThreeEvent<PointerEvent>) => {
    if (!modelRef.current || isFinaleActive || isReturning || !isDressed || transitionRef.current.active || event.button !== 0) return;
    event.stopPropagation();
    const target = event.target as Element | null;
    target?.setPointerCapture?.(event.pointerId);
    gl.domElement.classList.add("is-dragging");
    rotationRef.current = {
      active: true,
      lastX: event.clientX,
      target: modelRef.current.rotation.y,
      velocity: 0,
    };
  };

  const drag = (event: ThreeEvent<PointerEvent>) => {
    if (!rotationRef.current.active || isFinaleActive || isReturning || !isDressed || transitionRef.current.active) return;
    event.stopPropagation();

    const rotation = rotationRef.current;
    const pointerDelta = THREE.MathUtils.clamp(event.clientX - rotation.lastX, -80, 80);
    const angularDelta = pointerDelta * 0.0095;

    rotation.lastX = event.clientX;
    rotation.target += angularDelta;
    rotation.velocity = THREE.MathUtils.clamp(angularDelta * 42, -7.5, 7.5);
  };

  const endDrag = (event: ThreeEvent<PointerEvent>) => {
    if (!rotationRef.current.active) return;
    event.stopPropagation();
    const target = event.target as Element | null;
    target?.releasePointerCapture?.(event.pointerId);
    rotationRef.current.active = false;
    gl.domElement.classList.remove("is-dragging");
  };

  return (
    <>
      <color attach="background" args={["#020202"]} />
      <fog attach="fog" args={["#050505", 4.5, 11]} />
      <PerspectiveCamera makeDefault fov={38} position={[0, 1.35, 8.8]} />
      <Environment preset="city" environmentIntensity={0.18} />

      <ambientLight ref={ambientRef} intensity={0.22} />
      <spotLight
        ref={spotlightRef}
        position={[0, 5.8, 3.6]}
        intensity={4.2}
        angle={0.23}
        penumbra={0.95}
        decay={1.3}
        color="#fff4dc"
        castShadow
      />
      <pointLight ref={fillRef} position={[-2.8, 2.2, 2.8]} intensity={0.35} color="#b8c6ff" />
      <pointLight ref={warmRef} position={[2.4, 1.8, -1.4]} intensity={0.45} color="#e4c38d" />

      <group ref={stageRef}>
        <mesh position={[0, -1.72, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[3.8, 96]} />
          <meshStandardMaterial color="#090909" roughness={0.72} metalness={0.16} />
        </mesh>

        <mesh position={[0, -1.71, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.45, 2.8, 120]} />
          <meshBasicMaterial color="#f2d8a2" transparent opacity={0.045} />
        </mesh>

        <Float speed={1.1} rotationIntensity={isFinaleActive ? 0 : 0.05} floatIntensity={isFinaleActive ? 0 : 0.08}>
          <group
            ref={modelRef}
            position={[0, -0.08, 0]}
            onPointerDown={beginDrag}
            onPointerMove={drag}
            onPointerUp={endDrag}
          >
            <Suspense fallback={<ModelLoadingFallback />}>
              <ModelErrorBoundary
                modelPath={activeModelPath}
                fallbackPath={lastGoodModelPathRef.current}
                onRecover={(fallbackPath, error) => {
                  console.warn(`[Fashion Showroom] Failed to render selected model: ${activeModelPath}`, error);
                  transitionRef.current.active = false;
                  transitionRef.current.modelOpacity = 1;
                  transitionRef.current.particleOpacity = 0;
                  transitionRef.current.scanOpacity = 0;
                  activeModelPathRef.current = fallbackPath;
                  setActiveModelPath(fallbackPath);
                  setTransitionTick((tick) => tick + 1);
                  setIsDressed(true);
                }}
              >
                <FashionModel mouseRef={mouseRef} modelPath={activeModelPath} modelOpacity={transitionRef.current.modelOpacity} />
              </ModelErrorBoundary>
            </Suspense>
          </group>
        </Float>

        <DarkTransitionEffects particleRef={particleRef} scanRef={scanRef} transitionRef={transitionRef} />

        <Sparkles
          ref={sparkleRef}
          count={45}
          scale={[4.5, 1.8, 4.5]}
          size={1.8}
          speed={0.14}
          opacity={0.18}
          color="#d8c59b"
          position={[0, 0.5, -0.4]}
        />
        <Stars radius={8} depth={3} count={120} factor={1.2} saturation={0} fade speed={0.1} />
      </group>
    </>
  );
}

type ModelErrorBoundaryProps = {
  children: React.ReactNode;
  modelPath: string;
  fallbackPath: string;
  onRecover: (fallbackPath: string, error: unknown) => void;
};

type ModelErrorBoundaryState = {
  hasError: boolean;
};

class ModelErrorBoundary extends React.Component<ModelErrorBoundaryProps, ModelErrorBoundaryState> {
  constructor(props: ModelErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onRecover(this.props.fallbackPath, error);
  }

  componentDidUpdate(previousProps: ModelErrorBoundaryProps) {
    if (previousProps.modelPath !== this.props.modelPath && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function ModelLoadingFallback() {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.z += delta * 0.8;
  });

  return (
    <group position={[0, 0, 0.18]}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.008, 12, 96]} />
        <meshBasicMaterial color="#dfc98d" transparent opacity={0.72} />
      </mesh>
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[0.18, 48]} />
        <meshBasicMaterial color="#f6efe4" transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

function DarkTransitionEffects({
  particleRef,
  scanRef,
  transitionRef,
}: {
  particleRef: React.RefObject<THREE.Group | null>;
  scanRef: React.RefObject<THREE.Mesh | null>;
  transitionRef: React.RefObject<TransitionState>;
}) {
  const particles = useMemo(() => {
    return Array.from({ length: 42 }, (_, index) => {
      const angle = (index / 42) * Math.PI * 2;
      const radius = 0.22 + (index % 7) * 0.055;
      const height = -1.1 + (index % 11) * 0.22;
      return {
        position: [Math.cos(angle) * radius, height, Math.sin(angle) * radius] as [number, number, number],
        scale: 0.008 + (index % 5) * 0.003,
      };
    });
  }, []);

  const transition = transitionRef.current;

  return (
    <>
      <group ref={particleRef} position={[0, 0.08, 0]}>
        {particles.map((particle, index) => (
          <mesh key={index} position={particle.position} scale={particle.scale}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#1d2027" transparent opacity={transition.particleOpacity} depthWrite={false} />
          </mesh>
        ))}
      </group>
      <mesh ref={scanRef} position={[0, transition.scanY, 0.34]} rotation={[0, 0, 0]}>
        <planeGeometry args={[1.25, 0.035]} />
        <meshBasicMaterial
          color="#d8dff4"
          transparent
          opacity={transition.scanOpacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

export default function ClothingScene(props: ClothingSceneProps) {
  return (
    <div className="clothing-canvas-shell">
      <Canvas shadows dpr={[1, 1.8]} gl={{ antialias: true, alpha: false }}>
        <Experience {...props} />
      </Canvas>
    </div>
  );
}
