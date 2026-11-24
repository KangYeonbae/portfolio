"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { MathUtils } from "three";

const frames = Array.from({ length: 16 }, (_, index) => ({
  z: -index * 3.8,
  width: index < 3 ? 4.9 : 5.8 + (index % 3) * 0.55,
  color: index < 6 ? "#8882ff" : index < 11 ? "#63e8cc" : "#daa3ff",
}));

function Gallery({ progress }: { progress: number }) {
  useFrame(({ camera }, delta) => {
    const speed = 1 - Math.exp(-7 * Math.min(delta, 0.1));
    camera.position.z = MathUtils.lerp(camera.position.z, 5 - progress * 55, speed);
    camera.position.x = MathUtils.lerp(camera.position.x, Math.sin(progress * Math.PI * 3) * 1.5, speed);
    camera.position.y = MathUtils.lerp(camera.position.y, 1.55 + Math.sin(progress * Math.PI) * 0.6, speed);
    camera.lookAt(0.55, 2.15, camera.position.z - 10);
  });

  return (
    <>
      <fogExp2 attach="fog" args={["#101224", 0.068]} />
      <mesh position={[0, -0.08, -28]}>
        <boxGeometry args={[19, 0.15, 72]} />
        <meshBasicMaterial color="#11152f" />
      </mesh>
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

export default function Scene({ progress }: { progress: number }) {
  return (
    <Canvas
      camera={{ position: [0, 1.55, 5], fov: 63 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      dpr={[1, 1.5]}
      fallback={null}
    >
      <Gallery progress={progress} />
    </Canvas>
  );
}
