"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending, CanvasTexture, Color, DoubleSide, Fog, MathUtils, Object3D, Vector3,
  type InstancedMesh, type Mesh, type MeshBasicMaterial, type PointLight, type Points, type PointsMaterial,
} from "three";

// The control room behind the report demo: server aisles, data flowing from the warehouse core
// toward the viewer, and a mood that follows the verification phase.
export type ReportMood = "idle" | "scan" | "alert" | "fix" | "ok";
const moodColors: Record<ReportMood, string> = { idle: "#46c8c0", scan: "#7fe3ff", alert: "#ff4d5e", fix: "#ffc24d", ok: "#5cf2a1" };
const moodSpeed: Record<ReportMood, number> = { idle: 4, scan: 16, alert: 2.5, fix: 7, ok: 5 };

const FAR = -46;
const NEAR = 4;
const RACK_ROWS = 10;
const LEDS_PER_RACK = 18;
const STREAM = 700;
const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

function dotTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 32;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, "#fff");
    gradient.addColorStop(.35, "#ffffffaa");
    gradient.addColorStop(1, "#ffffff00");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
  }
  return new CanvasTexture(canvas);
}

function Racks() {
  const racks = useRef<InstancedMesh>(null);
  const leds = useRef<InstancedMesh>(null);
  const layout = useMemo(() => {
    const boxes: Vector3[] = [];
    const lights: Vector3[] = [];
    for (let row = 0; row < RACK_ROWS; row++) {
      for (const side of [-1, 1]) {
        const box = new Vector3(side * 5.2, 2.4, -4 - row * 4.2);
        boxes.push(box);
        for (let i = 0; i < LEDS_PER_RACK; i++) {
          // LEDs sit on the face that looks into the aisle
          lights.push(new Vector3(box.x - side * .81, .6 + (i % 9) * .45, box.z - .7 + Math.floor(i / 9) * 1.4));
        }
      }
    }
    return { boxes, lights };
  }, []);

  useEffect(() => {
    const dummy = new Object3D();
    layout.boxes.forEach((position, index) => {
      dummy.position.copy(position);
      dummy.updateMatrix();
      racks.current?.setMatrixAt(index, dummy.matrix);
    });
    layout.lights.forEach((position, index) => {
      dummy.position.copy(position);
      dummy.rotation.y = position.x > 0 ? -Math.PI / 2 : Math.PI / 2;
      dummy.updateMatrix();
      leds.current?.setMatrixAt(index, dummy.matrix);
    });
    if (racks.current) racks.current.instanceMatrix.needsUpdate = true;
    if (leds.current) leds.current.instanceMatrix.needsUpdate = true;
  }, [layout]);

  const blink = useMemo(() => new Color(), []);
  useFrame(({ clock }) => {
    const mesh = leds.current;
    if (!mesh) return;
    const time = clock.elapsedTime;
    for (let i = 0; i < layout.lights.length; i++) {
      // Each LED blinks on its own rhythm; instance color multiplies the mood color on the material
      const on = Math.sin(time * (1.5 + rand(i) * 5) + rand(i + 9) * 20) > .2 ? 1 : .18;
      mesh.setColorAt(i, blink.setScalar(on));
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return <>
    <instancedMesh ref={racks} args={[undefined, undefined, layout.boxes.length]}>
      <boxGeometry args={[1.6, 4.8, 3.4]} />
      <meshStandardMaterial color="#0d1822" roughness={.55} metalness={.6} />
    </instancedMesh>
    <instancedMesh ref={leds} args={[undefined, undefined, layout.lights.length]}>
      <planeGeometry args={[.16, .06]} />
      <meshBasicMaterial name="led" color="#46c8c0" toneMapped={false} />
    </instancedMesh>
  </>;
}

function Stream({ mood, reduced }: { mood: ReportMood; reduced: boolean }) {
  const points = useRef<Points>(null);
  const texture = useMemo(() => dotTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);
  const { positions, lanes } = useMemo(() => {
    const positions = new Float32Array(STREAM * 3);
    const lanes = Array.from({ length: STREAM }, (_, i) => ({
      x: (rand(i) - .5) * 6.4,
      y: .25 + rand(i + 1000) * 4.2,
      offset: rand(i + 2000) * (NEAR - FAR),
      speed: .7 + rand(i + 3000) * .6,
    }));
    lanes.forEach((lane, i) => positions.set([lane.x, lane.y, FAR + lane.offset], i * 3));
    return { positions, lanes };
  }, []);
  const travel = useRef(0);

  useFrame((_, delta) => {
    if (reduced || !points.current) return;
    travel.current += Math.min(delta, .05) * moodSpeed[mood];
    const attribute = points.current.geometry.attributes.position;
    for (let i = 0; i < STREAM; i++) {
      const lane = lanes[i];
      attribute.array[i * 3 + 2] = FAR + MathUtils.euclideanModulo(lane.offset + travel.current * lane.speed, NEAR - FAR);
    }
    attribute.needsUpdate = true;
  });

  return <points ref={points}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
    <pointsMaterial name="stream" map={texture} size={.11} transparent depthWrite={false} blending={AdditiveBlending} color={moodColors.idle} toneMapped={false} />
  </points>;
}

function Room({ mood, reduced }: { mood: ReportMood; reduced: boolean }) {
  const { scene, camera, pointer } = useThree();
  const target = useMemo(() => new Color(moodColors[mood]), [mood]);
  const light = useRef<PointLight>(null);
  const core = useRef<Mesh>(null);
  const beam = useRef<Mesh>(null);
  const start = useRef<number | null>(null);
  const look = useMemo(() => new Vector3(0, 1.9, -20), []);
  const fogColor = useMemo(() => new Color(), []);

  useFrame(({ clock }, rawDelta) => {
    const delta = Math.min(rawDelta, .05);
    const time = clock.elapsedTime;
    start.current ??= time;
    // Alert pulses red; every other mood glides to its color
    const pulse = mood === "alert" ? .55 + .45 * Math.sin(time * 9) : 1;
    const ease = reduced ? 1 : 1 - Math.exp(-3 * delta);
    scene.traverse((object) => {
      const material = (object as Mesh).material as MeshBasicMaterial | PointsMaterial | undefined;
      if (material && (material.name === "stream" || material.name === "led")) material.color.lerp(target, ease);
    });
    if (light.current) {
      light.current.color.lerp(target, ease);
      light.current.intensity = 40 * pulse;
    }
    if (core.current) (core.current.material as MeshBasicMaterial).color.lerp(target, ease);
    if (scene.fog instanceof Fog) scene.fog.color.lerp(fogColor.copy(target).multiplyScalar(mood === "alert" ? .16 * pulse : .05), ease);

    // Scanning: a sheet of light sweeps down the aisle
    if (beam.current) {
      beam.current.visible = mood === "scan" && !reduced;
      beam.current.position.z = FAR + MathUtils.euclideanModulo(time * 18, NEAR - FAR);
    }

    // Walk into the aisle on entry, then follow the pointer a little
    const intro = reduced ? 1 : MathUtils.smootherstep(Math.min(1, (time - start.current) / 2.4), 0, 1);
    camera.position.set(
      reduced ? 0 : pointer.x * .7 * intro,
      MathUtils.lerp(7, 2.2, intro) + (reduced ? 0 : pointer.y * .35),
      MathUtils.lerp(20, 7, intro),
    );
    camera.lookAt(look);
  });

  return <>
    <color attach="background" args={["#04080c"]} />
    <fog attach="fog" args={["#04080c", 6, 46]} />
    <ambientLight intensity={.25} />
    <pointLight ref={light} position={[0, 4.5, -10]} distance={40} decay={1.4} />
    <gridHelper args={[14, 28, "#1d3a45", "#10232b"]} position={[0, 0, -20]} scale={[1, 1, 3.4]} />
    <mesh ref={core} position={[0, 3, FAR - 2]}>
      <cylinderGeometry args={[1.4, 1.4, 7, 32, 1, true]} />
      <meshBasicMaterial color={moodColors.idle} transparent opacity={.55} toneMapped={false} />
    </mesh>
    <mesh ref={beam} position={[0, 2.2, 0]}>
      <planeGeometry args={[9.5, 4.8]} />
      <meshBasicMaterial color="#7fe3ff" transparent opacity={.12} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
    </mesh>
    <Racks />
    <Stream mood={mood} reduced={reduced} />
  </>;
}

export default function ReportScene({ mood }: { mood: ReportMood }) {
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return <Canvas camera={{ position: [0, 7, 20], fov: 55, near: .1, far: 80 }} dpr={[1, 1.5]}
    frameloop={reduced ? "demand" : "always"} gl={{ antialias: true, powerPreference: "low-power" }} fallback={null}>
    <Room mood={mood} reduced={reduced} />
  </Canvas>;
}
