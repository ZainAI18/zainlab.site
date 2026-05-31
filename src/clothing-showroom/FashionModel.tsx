import { memo, useEffect, useMemo, useRef } from "react";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { curatedLooks, defaultModelPath } from "./outfits";

export const BASE_MODEL_PATH = defaultModelPath;

type FashionModelProps = {
  mouseRef: RefObject<{ x: number; y: number }>;
  modelPath?: string;
  modelOpacity?: number;
};

type GLBFashionFigureProps = {
  mouseRef: RefObject<{ x: number; y: number }>;
  modelPath: string;
  opacity?: number;
};

function cloneMaterial(material: THREE.Material) {
  const cloned = material.clone();
  cloned.transparent = false;
  cloned.opacity = 1;

  if ("roughness" in cloned && typeof cloned.roughness === "number") {
    cloned.roughness = Math.max(cloned.roughness, 0.48);
  }

  if ("metalness" in cloned && typeof cloned.metalness === "number") {
    cloned.metalness = Math.min(cloned.metalness, 0.18);
  }

  return cloned;
}

function GLBFashionFigure({ modelPath, mouseRef, opacity = 1 }: GLBFashionFigureProps) {
  const { scene } = useGLTF(modelPath);
  const figureRef = useRef<THREE.Group>(null);

  const { modelScene, offset, scale } = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);

    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;

      const materials = Array.isArray(object.material) ? object.material : [object.material];

      if (object.material) {
        const clonedMaterials = materials.map((material) => cloneMaterial(material));
        object.material = Array.isArray(object.material) ? clonedMaterials : clonedMaterials[0];
      }
    });

    const targetHeight = 3.05;
    const normalizedScale = size.y > 0 ? targetHeight / size.y : 1;
    const footBaseline = -1.42;

    return {
      modelScene: clone,
      offset: new THREE.Vector3(-center.x, -box.min.y + footBaseline / normalizedScale, -center.z),
      scale: normalizedScale,
    };
  }, [modelPath, scene]);

  useEffect(() => {
    modelScene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if (!material) return;
        material.transparent = opacity < 1;
        material.opacity = opacity;
        material.needsUpdate = true;
      });
    });
  }, [modelScene, opacity]);

  useFrame((_, delta) => {
    if (!figureRef.current) return;
    const mouse = mouseRef.current;
    figureRef.current.rotation.x = THREE.MathUtils.damp(
      figureRef.current.rotation.x,
      THREE.MathUtils.clamp(mouse.y * 0.035, -0.035, 0.035),
      4,
      delta,
    );
    figureRef.current.rotation.z = THREE.MathUtils.damp(
      figureRef.current.rotation.z,
      THREE.MathUtils.clamp(-mouse.x * 0.025, -0.025, 0.025),
      4,
      delta,
    );
  });

  return (
    <group ref={figureRef} scale={scale}>
      <primitive object={modelScene} position={offset} />
    </group>
  );
}

function FashionModel({
  mouseRef,
  modelPath = BASE_MODEL_PATH,
  modelOpacity = 1,
}: FashionModelProps) {
  return (
    <group>
      <GLBFashionFigure modelPath={modelPath} mouseRef={mouseRef} opacity={modelOpacity} />
    </group>
  );
}

export default memo(FashionModel);

useGLTF.preload(BASE_MODEL_PATH);
curatedLooks.forEach((look) => useGLTF.preload(look.modelPath));
