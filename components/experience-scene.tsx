"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, type RefObject } from "react";
import { MathUtils, Vector3 } from "three";
import { exhibits } from "./gallery-layout";

type GalleryProps = {
  progress: number;
  active: number;
  marker: RefObject<HTMLButtonElement | null>;
};

const frames = Array.from({ length: 16 }, (_, index) => ({
  z: -index * 3.8,
  width: index < 3 ? 4.9 : 5.8 + (index % 3) * 0.55,
  color: index < 6 ? "#8882ff" : index < 11 ? "#63e8cc" : "#daa3ff",
}));

function Gallery({ progress, active, marker }: GalleryProps) {
  const point = useMemo(() => new Vector3(), []);
  useFrame(({ camera }, delta) => {
    const speed = 1 - Math.exp(-8 * Math.min(delta, 0.1));
    const exhibit = exhibits[active];
    const lane = Math.cos(progress * Math.PI * 2);
    camera.position.z = MathUtils.lerp(camera.position.z, 4.8 - progress * 32, speed);
    camera.position.x = MathUtils.lerp(camera.position.x, lane * 1.45, speed);
    camera.position.y = MathUtils.lerp(camera.position.y, 1.65 + progress * 0.8, speed);
    camera.lookAt(lane * 1.9, 2.3, camera.position.z - 9);
    camera.updateMatrixWorld();

    const button = marker.current;
    if (button) {
      point.set(exhibit.x, 2.45, exhibit.z + 0.42).project(camera);
      button.style.setProperty("--marker-x", `${MathUtils.clamp((point.x + 1) * 50, 24, 76)}%`);
      button.style.setProperty("--marker-y", `${MathUtils.clamp((1 - point.y) * 50, 32, 65)}%`);
    }
  });

  return (
    <>
      <fogExp2 attach="fog" args={["#101224", 0.068]} />
      <mesh position={[0, -0.08, -28]}>
        <boxGeometry args={[19, 0.15, 72]} />
        <meshBasicMaterial color="#11152f" />
      </mesh>
      {exhibits.map(({ x, z, color }, index) => (
        <group key={z} position={[x, 0, z]}>
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[4.3, 0.25, 3.4]} />
            <meshBasicMaterial color="#262945" />
          </mesh>
          <mesh position={[0, 1.35, 0]}>
            {index === 0 && <boxGeometry args={[3.7, 2.4, 0.35]} />}
            {index === 1 && <cylinderGeometry args={[1.55, 1.85, 2.4, 8]} />}
            {index === 2 && <cylinderGeometry args={[1.75, 1.95, 2.4, 48]} />}
            <meshBasicMaterial color="#252141" />
          </mesh>
          <mesh position={[0, 2.45, 0.26]}>
            {index === 0 && <boxGeometry args={[3.85, 2.6, 0.14]} />}
            {index === 1 && <torusGeometry args={[1.75, 0.07, 8, 6]} />}
            {index === 2 && <torusGeometry args={[1.85, 0.07, 8, 48]} />}
            <meshBasicMaterial color={color} wireframe={index === 0} />
          </mesh>
        </group>
      ))}
      {frames.map(({ z, width, color }, index) => (
        <group key={z} position={[0, 0, z]}>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * width, 0, 0]}>
              <mesh position={[0, 2.8, 0]}>
                <boxGeometry args={[0.48, 5.6, 0.4]} />
                <meshBasicMaterial color="#232849" />
              </mesh>
              <mesh position={[-side * 0.25, 2.8, 0.21]}>
                <boxGeometry args={[0.035, 5.6, 0.02]} />
                <meshBasicMaterial color={color} />
              </mesh>
              <mesh position={[-side * 0.6, 0.01, -1.9]}>
                <boxGeometry args={[0.035, 0.03, 3.8]} />
                <meshBasicMaterial color={color} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 5.6, 0]}>
            <boxGeometry args={[width * 2, 0.06, 0.05]} />
            <meshBasicMaterial color={color} />
          </mesh>
          {index % 3 === 2 && <mesh position={[0, 5.8, -0.5]}>
            <boxGeometry args={[width * 2, 0.3, 2.4]} />
            <meshBasicMaterial color="#292d51" />
          </mesh>}
        </group>
      ))}
    </>
  );
}

export default function Scene(props: GalleryProps) {
  return (
    <Canvas
      camera={{ position: [0, 1.55, 5], fov: 63 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      dpr={[1, 1.5]}
      fallback={null}
    >
      <Gallery {...props} />
    </Canvas>
  );
}
