"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import { CanvasTexture, Color, DataTexture, DoubleSide, MathUtils, Object3D, PMREMGenerator, PlaneGeometry, RepeatWrapping, SRGBColorSpace, TextureLoader } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { exhibits } from "./gallery-layout";

type GalleryProps = {
  progress: number;
  images: string[];
  onOpen: (index: number) => void;
  onReady: () => void;
};

const bays = Array.from({ length: 15 }, (_, index) => -index * 4 - 1);
const restingBays = [-6, -22, -38, -54];

function Panel({ position, size, color, roughness = .8 }: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  roughness?: number;
}) {
  return <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} roughness={roughness} />
  </mesh>;
}

// Soft indirect light so surfaces read as materials instead of flat colour fills.
function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, .04);
    scene.environment = target.texture;
    scene.environmentIntensity = .45;
    room.dispose();
    pmrem.dispose();
    return () => { scene.environment = null; target.dispose(); };
  }, [gl, scene]);
  return null;
}

function WoodFloor() {
  const wood = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const context = canvas.getContext("2d")!;
    const tones = ["#c9b49a", "#c2ab8f", "#cfbba2", "#bea688", "#c7b096"];
    // 8 planks across, staggered seams; a few grain streaks per plank.
    for (let row = 0; row < 8; row++) {
      for (let column = 0; column < 2; column++) {
        const y = column * 256 + (row % 2) * 128;
        context.fillStyle = tones[(row * 3 + column) % tones.length];
        context.fillRect(row * 64, y, 64, 256);
        context.fillRect(row * 64, y - 512, 64, 256);
        context.strokeStyle = "#00000014";
        for (let streak = 0; streak < 5; streak++) {
          const x = row * 64 + 6 + ((row * 13 + streak * 11 + column * 7) % 52);
          context.beginPath();
          context.moveTo(x, y);
          context.bezierCurveTo(x + 4, y + 80, x - 4, y + 170, x + 2, y + 256);
          context.stroke();
        }
      }
      context.fillStyle = "#6b553d33";
      context.fillRect(row * 64, 0, 1.5, 512);
    }
    context.fillRect(0, 128, 512, 1.5);
    context.fillRect(0, 384, 512, 1.5);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(1.5, 9);
    texture.anisotropy = 8;
    return texture;
  }, []);
  useEffect(() => () => wood.dispose(), [wood]);
  return <mesh position={[0, -.15, -26]} receiveShadow>
    <boxGeometry args={[12, .26, 70]} />
    <meshStandardMaterial map={wood} roughness={.55} />
  </mesh>;
}

function OutdoorView() {
  const meadowSource = useLoader(TextureLoader, "/project-media/gallery-meadow.webp");
  const meadow = useMemo(() => {
    const texture = meadowSource.clone();
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [meadowSource]);
  const grass = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const shades = ["#648648", "#7f9a50", "#9aaa64", "#526f3b"].map((hex) => new Color(hex));
    for (let index = 0; index < 390; index++) {
      const x = -6.25 - (index % 17) * .115;
      const z = 3 - ((index * 17) % 397) * .16;
      const height = .65 + (index % 9) * .115;
      const lean = Math.sin(index * 1.36) * .21;
      const tip = [x + lean, height, z + .08];
      positions.push(x - .036, -.19, z, x + .036, -.19, z, ...tip);
      positions.push(x, -.19, z - .038, x, -.19, z + .038, ...tip);
      const shade = shades[index % shades.length];
      for (let vertex = 0; vertex < 6; vertex++) colors.push(shade.r, shade.g, shade.b);
    }
    return { positions: new Float32Array(positions), colors: new Float32Array(colors) };
  }, []);

  useEffect(() => () => meadow.dispose(), [meadow]);

  return <>
    <mesh position={[-26, 9.4, -70]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[177, 51]} />
      <meshBasicMaterial map={meadow} toneMapped={false} fog={false} />
    </mesh>
    <mesh position={[-15.8, -.22, -28]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 72]} />
      <meshStandardMaterial color="#839a58" roughness={1} />
    </mesh>
    <mesh>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[grass.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[grass.colors, 3]} />
      </bufferGeometry>
      <meshBasicMaterial vertexColors side={DoubleSide} />
    </mesh>
  </>;
}

function Curtains() {
  const { geometry, lace } = useMemo(() => {
    const geometry = new PlaneGeometry(1.15, 3.9, 30, 4);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      positions.setXYZ(i, x + .09 * (1 - y / 1.95) * (x + .575), y, .07 * Math.cos(x * 28));
    }
    const size = 64;
    const pixels = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const distance = Math.hypot(x - 32, y - 32);
        const weave = x % 8 === 0 || y % 8 === 0;
        const flower = Math.abs(distance - 14) < 1.5 || Math.abs(x - 32) + Math.abs(y - 32) < 8;
        const value = flower ? 216 : weave ? 132 : 62;
        pixels.set([value, value, value, 255], (y * size + x) * 4);
      }
    }
    const lace = new DataTexture(pixels, size, size);
    lace.wrapS = lace.wrapT = RepeatWrapping;
    lace.repeat.set(4, 13);
    lace.needsUpdate = true;
    return { geometry, lace };
  }, []);

  useEffect(() => () => { geometry.dispose(); lace.dispose(); }, [geometry, lace]);

  return <group>
    {bays.filter((_, index) => index % 2 === 0).map((z) => (
      <mesh key={z} position={[-5.67, 2.95, z - .79]} rotation={[0, Math.PI / 2, 0]} geometry={geometry}>
        <meshBasicMaterial color="#fff8ed" alphaMap={lace} transparent opacity={.7} depthWrite={false} side={DoubleSide} />
      </mesh>
    ))}
  </group>;
}

function WindowSeat({ z }: { z: number }) {
  return <group position={[-4.44, 0, z]}>
    <Panel position={[0, .43, 0]} size={[.57, .16, 2.02]} color="#a17e5c" />
    {[-.72, .72].map((end) =>
      <Panel key={end} position={[0, .18, end]} size={[.45, .38, .14]} color="#bd9f7c" />,
    )}
    <mesh position={[-.4, .24, 1.72]}>
      <cylinderGeometry args={[.29, .22, .47, 16]} />
      <meshStandardMaterial color="#b58c72" roughness={.92} />
    </mesh>
    {Array.from({ length: 7 }, (_, index) => {
      const angle = index * Math.PI * 2 / 7;
      return <mesh key={index}
        position={[-.4 + Math.sin(angle) * .19, .76 + (index % 3) * .085, 1.72 + Math.cos(angle) * .19]}
        scale={[.15, .44, .075]} rotation={[.45 * Math.cos(angle), angle, .48 * Math.sin(angle)]}>
        <sphereGeometry args={[1, 8, 5]} />
        <meshStandardMaterial color={index % 2 ? "#698455" : "#829760"} roughness={.88} />
      </mesh>;
    })}
  </group>;
}

function Gallery({ progress, images, onOpen, onReady }: GalleryProps) {
  const textures = useLoader(TextureLoader, images);
  const sunTarget = useMemo(() => new Object3D(), []);

  useEffect(() => {
    textures.forEach((texture) => {
      if (texture.colorSpace !== SRGBColorSpace) {
        texture.colorSpace = SRGBColorSpace;
        texture.needsUpdate = true;
      }
    });
    onReady();
  }, [textures, onReady]);

  useFrame(({ camera }, delta) => {
    const amount = 1 - Math.exp(-8 * Math.min(delta, 0.1));
    const shift = Math.cos(progress * Math.PI * (exhibits.length - 1));
    const windowGlance = Math.sin(progress * Math.PI * (exhibits.length - 1)) ** 2;
    camera.position.z = MathUtils.lerp(camera.position.z, 3.2 - progress * 48, amount);
    camera.position.x = MathUtils.lerp(camera.position.x, shift * 0.6, amount);
    camera.position.y = MathUtils.lerp(camera.position.y, 2.9, amount);
    camera.lookAt(shift * 2.3 - windowGlance * 2.5, 2.25, camera.position.z - 9);
  });

  return (
    <>
      <color attach="background" args={["#e6eef2"]} />
      <fog attach="fog" args={["#e6eef2", 16, 62]} />
      <Environment />
      <hemisphereLight args={["#fff6e8", "#c9c2b6", .7]} />
      <primitive object={sunTarget} position={[0, 0, -28]} />
      {/* Low afternoon sun through the window wall: pillars throw stripes across the floor. */}
      <directionalLight position={[-14, 9, -22]} target={sunTarget} color="#ffe6c4" intensity={3.4}
        castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-.0004} shadow-normalBias={.03} shadow-radius={3}
        shadow-camera-left={-40} shadow-camera-right={40} shadow-camera-top={40} shadow-camera-bottom={-40}
        shadow-camera-near={1} shadow-camera-far={60} />
      <Suspense fallback={null}><OutdoorView /></Suspense>
      <Curtains />
      {restingBays.map((z) => <WindowSeat key={z} z={z} />)}
      <WoodFloor />
      <Panel position={[5.87, 2.7, -26]} size={[0.25, 5.4, 70]} color="#f1ece3" roughness={.95} />
      <Panel position={[5.72, .09, -26]} size={[.06, .18, 70]} color="#b89a7a" roughness={.6} />
      <Panel position={[0, 5.45, -26]} size={[12, 0.2, 70]} color="#fbf7f0" roughness={.95} />
      <Panel position={[0, 2.7, -60]} size={[12, 5.4, 0.2]} color="#f2e8dc" />

      {bays.map((z, index) => (
        <group key={z} position={[0, 0, z]}>
          <Panel position={[-5.8, 2.7, 0]} size={[.42, 5.4, .38]} color="#f5efe4" />
          <Panel position={[-5.8, .41, -2]} size={[.24, .82, 4]} color="#ded6c8" />
          <Panel position={[-5.73, .84, -2]} size={[.44, .08, 4]} color="#b89a7a" roughness={.6} />
          <Panel position={[-5.8, 3.53, -2]} size={[.1, .055, 4]} color="#cabba9" />
          <Panel position={[-5.8, 2.83, -2]} size={[.1, 3.93, .045]} color="#cabba9" />
          <Panel position={[0, 5.27, 0]} size={[12, .16, .3]} color="#efe5d8" roughness={.9} />
          {index % 2 === 1 && (
            <mesh position={[1.65, 5.34, -1]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.2, .7]} />
              <meshBasicMaterial color="#fffaf0" toneMapped={false} />
            </mesh>
          )}
        </group>
      ))}

      {exhibits.map(({ x, z, color }, index) => {
        const texture = textures[index];
        const ratio = texture.image.width / texture.image.height;
        const width = Math.min(4, 2.45 * ratio);
        const height = width / ratio;
        const artY = 2.45;
        const frameTop = artY + height / 2 + .21;

        return (
          <group key={z} position={[x, 0, z]} rotation={[0, -Math.sign(x) * .13, 0]}>
            {/* Free-standing gallery wall on an oak plinth; project colour survives as a thin top line. */}
            <Panel position={[0, .06, -.2]} size={[4.7, .12, 1.1]} color="#b89a7a" roughness={.6} />
            <Panel position={[0, 2.07, -.2]} size={[4.9, 3.9, .18]} color="#f7f3ec" roughness={.95} />
            <Panel position={[0, 4.04, -.2]} size={[4.9, .04, .19]} color={color} />
            <Panel position={[0, artY, -.06]} size={[width + .42, height + .42, .1]} color="#3a2d24" roughness={.45} />
            <mesh position={[0, artY, -.005]}>
              <planeGeometry args={[width + .26, height + .26]} />
              <meshStandardMaterial color="#fbf8f2" roughness={.9} />
            </mesh>
            <Panel position={[0, frameTop + .08, .1]} size={[1.3, .05, .09]} color="#b8955a" roughness={.35} />
            <pointLight position={[0, frameTop + .1, .9]} color="#ffe2b8" intensity={3} distance={4.5} decay={2} />
            <group onClick={(event) => { event.stopPropagation(); onOpen(index); }}>
              <mesh position={[0, artY, .002]}>
                <planeGeometry args={[width, height]} />
                <meshBasicMaterial map={texture} toneMapped={false} />
              </mesh>
              <Panel position={[0, .8, -.09]} size={[1.1, .3, .04]} color="#fffdf8" roughness={.7} />
              <Panel position={[-.52, .8, -.085]} size={[.06, .3, .045]} color={color} />
              <mesh position={[.36, .8, -.06]} rotation={[0, 0, -Math.PI / 2]}>
                <coneGeometry args={[.06, .11, 3]} />
                <meshBasicMaterial color="#3a2d24" />
              </mesh>
            </group>
          </group>
        );
      })}
    </>
  );
}

export default function Scene(props: GalleryProps) {
  return (
    <Canvas
      camera={{ position: [0, 2.9, 3.2], fov: 61 }}
      shadows="percentage"
      gl={{ antialias: true, powerPreference: "low-power" }}
      dpr={[1, 1.5]}
      fallback={null}
    >
      <Suspense fallback={null}><Gallery {...props} /></Suspense>
    </Canvas>
  );
}
