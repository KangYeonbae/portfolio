"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
function Objects({ progress }: { progress: number }) {
 const group = useRef<Group>(null);
 useFrame(() => { if (!group.current) return; group.current.rotation.y += (progress * 4 - group.current.rotation.y) * 0.06; group.current.rotation.x += (progress * 1.3 - 0.3 - group.current.rotation.x) * 0.06; });
 return <group ref={group} rotation={[-0.3, 0, 0]}><mesh><icosahedronGeometry args={[1.55, 1]} /><meshStandardMaterial color="#a29bff" wireframe transparent opacity={0.38} /></mesh><mesh><icosahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#6557ff" metalness={0.5} roughness={0.25} transparent opacity={0.7} /></mesh><mesh rotation={[1.2, 0.4, 0]}><torusGeometry args={[2.2, 0.008, 8, 100]} /><meshBasicMaterial color="#94f4cc" /></mesh><mesh rotation={[0.4, 1, 0]}><torusGeometry args={[2.6, 0.006, 8, 100]} /><meshBasicMaterial color="#a49aff" /></mesh></group>;
}
export default function Scene({ progress }: { progress: number }) { return <Canvas camera={{ position: [0, 0, 7], fov: 42 }} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }} dpr={[1, 1.5]}><ambientLight intensity={1.4} /><pointLight position={[3, 4, 5]} intensity={45} color="#b2aaff" /><Objects progress={progress} /></Canvas>; }
