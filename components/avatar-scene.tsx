"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Box3, MathUtils, Vector3, type Bone, type Euler, type Object3D } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

type Props = { onReady: () => void; onError: () => void };
function Model({ onReady, onError }: Props) {
  const [model, setModel] = useState<Object3D | null>(null);
  const head = useRef<Bone | null>(null);
  const base = useRef<Euler | null>(null);
  useEffect(() => {
    let active = true;
    new GLTFLoader().load("/portrait/avatar.glb", (gltf) => {
      if (!active) return;
      let found: Bone | null = null;
      gltf.scene.traverse((object) => {
        if ((object as Bone).isBone && /head$/i.test(object.name)) found ??= object as Bone;
      });
      if (!found) { onError(); return; }
      const bone = found as Bone;
      head.current = bone; base.current = bone.rotation.clone();
      gltf.scene.updateMatrixWorld(true);
      const bounds = new Box3().setFromObject(gltf.scene);
      const size = bounds.getSize(new Vector3());
      if (!Number.isFinite(size.y) || size.y <= 0) { onError(); return; }
      const center = bounds.getCenter(new Vector3());
      const scale = 2 / size.y;
      gltf.scene.scale.setScalar(scale);
      gltf.scene.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
      setModel(gltf.scene);
      onReady();
    }, undefined, () => { if (active) onError(); });
    return () => { active = false; };
  }, [onReady, onError]);
  useFrame(({ pointer }, delta) => {
    if (!head.current || !base.current) return;
    const factor = 1 - Math.exp(-6 * Math.min(delta, 0.1));
    head.current.rotation.y = MathUtils.lerp(head.current.rotation.y, base.current.y + pointer.x * 0.35, factor);
    head.current.rotation.x = MathUtils.lerp(head.current.rotation.x, base.current.x - pointer.y * 0.2, factor);
  });
  return model ? <primitive object={model} /> : null;
}
export default function AvatarScene(props: Props) {
  return <Canvas camera={{ position: [0, 1.62, 1.55], fov: 38 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }} fallback={<span />}><ambientLight intensity={1.5} /><directionalLight position={[2, 4, 4]} intensity={2} /><Model {...props} /></Canvas>;
}
