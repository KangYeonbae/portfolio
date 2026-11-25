"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import { MathUtils, NeutralToneMapping, SRGBColorSpace, TextureLoader, Vector3, type Texture } from "three";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";

const roomModel = "/project-media/apartment-room-v2.glb";
const meadowImage = "/project-media/gallery-meadow.webp";

type RoomProps = {
  progress: number;
  images: string[];
  onOpen: (index: number) => void;
  onReady: () => void;
};

type Point = [number, number, number];

// Coordinates follow the tevy model's meter scale, with the open side facing +Z.
const stops: { camera: Point; frame: Point; rotation: Point; width: number }[] = [
  { camera: [-.18, 1.48, 1.93], frame: [-.12, 1.43, -1.82], rotation: [0, 0, 0], width: 1.54 },
  { camera: [.48, 1.43, .95], frame: [2.89, 1.5, -.96], rotation: [0, -Math.PI / 2, 0], width: .98 },
  { camera: [-.37, 1.55, 1.64], frame: [-2.89, 1.57, 1.36], rotation: [0, Math.PI / 2, 0], width: .91 },
  { camera: [.13, 1.25, .87], frame: [0, .83, -.43], rotation: [-.22, .08, 0], width: .65 },
];

function RoomCamera({ progress }: { progress: number }) {
  const vectors = useMemo(() => ({
    position: new Vector3(...stops[0].camera),
    target: new Vector3(...stops[0].frame),
    nextPosition: new Vector3(),
    nextTarget: new Vector3(),
    end: new Vector3(),
  }), []);

  useFrame(({ camera }, delta) => {
    const step = progress * (stops.length - 1);
    const index = Math.min(Math.floor(step), stops.length - 2);
    const mix = MathUtils.smoothstep(step - index, 0, 1);
    const start = stops[index];
    const end = stops[index + 1];
    const damping = 1 - Math.exp(-7 * Math.min(delta, .1));

    vectors.nextPosition.set(...start.camera).lerp(vectors.end.set(...end.camera), mix);
    vectors.nextTarget.set(...start.frame).lerp(vectors.end.set(...end.frame), mix);
    vectors.position.lerp(vectors.nextPosition, damping);
    vectors.target.lerp(vectors.nextTarget, damping);
    camera.position.copy(vectors.position);
    camera.lookAt(vectors.target);
  });

  return null;
}

function ProjectFrame({ index, texture, onOpen }: {
  index: number;
  texture: Texture<HTMLImageElement>;
  onOpen: RoomProps["onOpen"];
}) {
  const { frame, rotation, width: maxWidth } = stops[index];
  const ratio = texture.image.width / texture.image.height;
  const width = Math.min(maxWidth, (index === 3 ? .53 : .7) * ratio);
  const height = width / ratio;
  const tabletop = index === 3;

  return (
    <group position={frame} rotation={rotation} onClick={(event) => {
      event.stopPropagation();
      onOpen(index);
    }}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width + .07, height + .07, .035]} />
        <meshStandardMaterial color="#493a2c" roughness={.62} />
      </mesh>
      <mesh position={[0, 0, .019]}>
        <planeGeometry args={[width + .035, height + .035]} />
        <meshStandardMaterial color="#f3ede2" roughness={.82} />
      </mesh>
      <mesh position={[0, 0, .02]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {tabletop && (
        <mesh position={[0, -.225, -.075]} rotation={[.36, 0, 0]} castShadow>
          <boxGeometry args={[.24, .24, .025]} />
          <meshStandardMaterial color="#493a2c" roughness={.62} />
        </mesh>
      )}
    </group>
  );
}

function Room({ loader, progress, images, onOpen, onReady }: RoomProps & { loader: GLTFLoader }) {
  const { scene } = useLoader(loader, roomModel);
  const textures = useLoader(TextureLoader, images);
  const meadow = useLoader(TextureLoader, meadowImage);

  useEffect(() => {
    for (const texture of [...textures, meadow]) {
      if (texture.colorSpace !== SRGBColorSpace) {
        texture.colorSpace = SRGBColorSpace;
        texture.needsUpdate = true;
      }
    }
    scene.traverse((object) => {
      if (object.type !== "Mesh" || object.name === "room_glass") return;
      object.castShadow = true;
      object.receiveShadow = true;
    });
    onReady();
  }, [scene, textures, meadow, onReady]);

  return (
    <>
      <color attach="background" args={["#e0e7e5"]} />
      <hemisphereLight args={["#f1f7ff", "#bba48f", 1.8]} />
      <directionalLight position={[-3.6, 3.2, -5]} color="#ffedcf" intensity={2.4} castShadow
        shadow-mapSize={[1024, 1024]} shadow-bias={-.0003} shadow-normalBias={.04}
        shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4}
        shadow-camera-near={.5} shadow-camera-far={12} />
      <directionalLight position={[.5, 2, 3]} color="#fff0de" intensity={.75} />
      <mesh position={[0, 2.2, -7]}>
        <planeGeometry args={[18, 10]} />
        <meshBasicMaterial map={meadow} toneMapped={false} />
      </mesh>
      <primitive object={scene} />
      <mesh position={[0, 1.3, 2.16]} receiveShadow>
        <boxGeometry args={[6.2, 2.6, .18]} />
        <meshStandardMaterial color="#ddd6c9" roughness={.9} />
      </mesh>
      {textures.map((texture, index) => (
        <ProjectFrame key={images[index]} index={index} texture={texture} onOpen={onOpen} />
      ))}
      <RoomCamera progress={progress} />
    </>
  );
}

function RoomAssets(props: RoomProps) {
  const renderer = useThree((state) => state.gl);
  const { loader, transcoder } = useMemo(() => {
    const transcoder = new KTX2Loader().setTranscoderPath("/three-basis/").detectSupport(renderer);
    const loader = new GLTFLoader().setKTX2Loader(transcoder).setMeshoptDecoder(MeshoptDecoder);
    return { loader, transcoder };
  }, [renderer]);

  useEffect(() => () => { transcoder.dispose(); }, [transcoder]);

  return <Suspense fallback={null}><Room loader={loader} {...props} /></Suspense>;
}

export default function ApartmentScene(props: RoomProps) {
  return (
    <Canvas camera={{ position: stops[0].camera, fov: 51, near: .055, far: 25 }}
      gl={{ antialias: true, toneMapping: NeutralToneMapping }} shadows="percentage" dpr={[1, 1.5]} fallback={null}>
      <RoomAssets {...props} />
    </Canvas>
  );
}
