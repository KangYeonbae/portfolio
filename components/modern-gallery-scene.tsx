"use client";

import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  CanvasTexture, EquirectangularReflectionMapping, ExtrudeGeometry, MathUtils, Mesh, NeutralToneMapping,
  Object3D, Path, ShaderMaterial, Shape, SRGBColorSpace, TextureLoader, Vector2,
  type Group, type MeshStandardMaterial, type PointLight, type Texture, type Vector3,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";

import { GalleryWalker, walkerUrl } from "./gallery-walker";
import { isGalleryFloor } from "./gallery-navigation";

const modelUrl = "/project-media/modern-gallery.glb";
const daylightUrl = "/project-media/gallery-daylight-1k.hdr";
const galleryModels = [modelUrl, walkerUrl];

type Point = [number, number, number];
type View = { eye: Point; target: Point };
type SceneProps = {
  images: string[];
  onOpen: (index: number) => void;
  onReady: () => void;
  startIndex: number;
  exhibitRequest: { index: number } | null;
  paused: boolean;
  onExhibit: (index: number) => void;
};

const entrance: View = { eye: [3.65, 1.56, -3.7], target: [2.8, 1.6, 2.3] };
const statueWall: View = { eye: [3.45, 1.55, -2.75], target: [-.28, 1.65, -.72] };
const southWall: View = { eye: [6.25, 1.55, 4.45], target: [7.18, 1.7, 7.45] };
const northWall: View = { eye: [5.05, 1.55, -3.55], target: [4.96, 1.62, -7.46] };
const lowerHall: View = { eye: [14.85, -.58, -3.3], target: [17.2, -.52, -7.46] };
const eastWall: View = { eye: [17.85, -.58, 3.85], target: [18.9, -.48, 7.46] };
const rearPartition: View = { eye: [-3.65, 1.55, .85], target: [-.73, 1.65, .85] };
const westWall: View = { eye: [-6.85, 1.55, -3.0], target: [-9.96, 1.65, -3.0] };
const rearSouthWall: View = { eye: [-4.4, 1.55, 4.35], target: [-4.4, 1.65, 7.46] };

const stops = [statueWall, southWall, northWall, lowerHall, eastWall, rearPartition, westWall, rearSouthWall];

const frames: { center: Point; angle: number; width: number; maxHeight: number }[] = [
  { center: statueWall.target, angle: Math.PI / 2, width: 3.05, maxHeight: 1.68 },
  { center: southWall.target, angle: Math.PI, width: 3, maxHeight: 1.65 },
  { center: northWall.target, angle: 0, width: 2.75, maxHeight: 1.55 },
  { center: lowerHall.target, angle: 0, width: 2.7, maxHeight: 1.58 },
  { center: eastWall.target, angle: Math.PI, width: 2.45, maxHeight: 1.6 },
  { center: rearPartition.target, angle: -Math.PI / 2, width: 2.85, maxHeight: 1.62 },
  { center: westWall.target, angle: Math.PI / 2, width: 2.8, maxHeight: 1.6 },
  { center: rearSouthWall.target, angle: Math.PI, width: 2.85, maxHeight: 1.62 },
];

// These triangles carry the original emissive glass, distinct from the mullions.
// Indices match the Zeps3D CC BY 4.0 GLB export stored with this scene.
const paneFaces = {
  Window_details_0: new Set([56, 57, 66, 67, 76, 77, 86, 87, 96, 97,
    166, 167, 176, 177, 186, 187, 196, 197, 206, 207]),
  ceiling_walls_0: new Set([34, 35, 86, 87, 90, 91, 92, 93, 114, 115, 116, 117,
    124, 125, 126, 127, 136, 137, 150, 151, 152, 153, 154, 155]),
};

function WindowLight({ position, aim, intensity }: { position: Point; aim: Point; intensity: number }) {
  const target = useMemo(() => new Object3D(), []);
  return (
    <>
      <primitive object={target} position={aim} />
      <spotLight position={position} target={target} angle={.64} penumbra={.88}
        color="#fff2dd" intensity={intensity} />
    </>
  );
}

function rectangularRing(width: number, height: number, border: number, depth: number, bevel: number) {
  const rectangle = (w: number, h: number) => [
    new Vector2(-w / 2, -h / 2), new Vector2(w / 2, -h / 2),
    new Vector2(w / 2, h / 2), new Vector2(-w / 2, h / 2),
  ];
  const shape = new Shape(rectangle(width + 2 * border, height + 2 * border));
  shape.holes.push(new Path(rectangle(width, height).reverse()));
  return new ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: bevel, bevelThickness: bevel,
  });
}

function createArtworkLabel() {
  const canvas = document.createElement("canvas");
  canvas.width = 288;
  canvas.height = 80;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#795a37";
    context.fillRect(0, 0, 288, 80);
    context.fillStyle = "#fbf2e1";
    context.fillRect(3, 3, 282, 74);
    context.fillStyle = "#382617";
    context.font = 'bold 35px "Malgun Gothic", sans-serif';
    context.textBaseline = "middle";
    context.fillText("작품 보기", 27, 41);
    context.font = "bold 34px sans-serif";
    context.fillText("↗", 224, 41);
  }
  const label = new CanvasTexture(canvas);
  label.colorSpace = SRGBColorSpace;
  return label;
}

function ProjectArtwork({ index, texture, label, actor, paused, onOpen }: {
  index: number;
  texture: Texture<HTMLImageElement>;
  label: Texture;
  actor: RefObject<Group | null>;
  paused: boolean;
  onOpen: SceneProps["onOpen"];
}) {
  const frame = frames[index];
  const aspect = texture.image.width / texture.image.height;
  const width = Math.min(frame.width, frame.maxHeight * aspect);
  const height = width / aspect;
  const { wood, brass } = useMemo(() => ({
    wood: rectangularRing(width + .24, height + .24, .085, .12, .018),
    brass: rectangularRing(width + .17, height + .17, .03, .022, .006),
  }), [width, height]);
  const lampWidth = Math.min(width * .58, 1.25);
  const lampHeight = height / 2 + .42;
  const canvas = useThree((state) => state.gl.domElement);
  const hovered = useRef(false);
  const trim = useRef<MeshStandardMaterial>(null);
  const lamp = useRef<PointLight>(null);
  const emphasis = useRef(0);

  useFrame((_, delta) => {
    if (!trim.current || !lamp.current) return;
    const position = actor.current?.position;
    let nearby = 0;
    if (position && Math.abs(position.y + 1.55 - frame.center[1]) < .8) {
      const dx = position.x - frame.center[0];
      const dz = position.z - frame.center[2];
      if (dx * Math.sin(frame.angle) + dz * Math.cos(frame.angle) > 0) {
        nearby = 1 - MathUtils.smoothstep(Math.hypot(dx, dz), 2.25, 4.5);
      }
    }
    const target = !paused && hovered.current ? 1 : nearby * .57;
    emphasis.current = MathUtils.damp(emphasis.current, target, 10, delta);
    trim.current.emissiveIntensity = emphasis.current * .82;
    lamp.current.intensity = 2.4 + emphasis.current * 3.6;
  });

  useEffect(() => () => {
    wood.dispose();
    brass.dispose();
  }, [wood, brass]);

  return (
    <group position={frame.center} rotation={[0, frame.angle, 0]}>
      <mesh position={[0, 0, .19]}
        onPointerOver={(event) => {
          event.stopPropagation();
          hovered.current = true;
          canvas.setAttribute("data-gallery-cursor", "artwork");
        }}
        onPointerMove={(event) => event.stopPropagation()}
        onPointerOut={() => {
          hovered.current = false;
          if (canvas.dataset.galleryCursor === "artwork") canvas.removeAttribute("data-gallery-cursor");
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (event.delta < 8) onOpen(index);
        }}>
        <planeGeometry args={[width + .43, height + .44]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <mesh geometry={wood} castShadow receiveShadow position={[0, 0, .023]}>
        <meshStandardMaterial color="#674936" roughness={.63} />
      </mesh>
      <mesh geometry={brass} castShadow receiveShadow position={[0, 0, .103]}>
        <meshStandardMaterial ref={trim} color="#b39462" emissive="#ffc16c" emissiveIntensity={0}
          metalness={.58} roughness={.35} />
      </mesh>
      <mesh position={[0, 0, .067]} receiveShadow>
        <boxGeometry args={[width + .28, height + .28, .018]} />
        <meshStandardMaterial color="#ece5d6" roughness={.94} />
      </mesh>
      <mesh position={[0, 0, .077]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, .103]}>
        <planeGeometry args={[width + .153, height + .153]} />
        <meshPhysicalMaterial color="#fff6e9" transparent opacity={.055} depthWrite={false}
          roughness={.14} metalness={.24} clearcoat={.8} />
      </mesh>
      <mesh position={[width / 2 - .26, -height / 2 - .11, .18]}>
        <planeGeometry args={[.77, .214]} />
        <meshBasicMaterial map={label} toneMapped={false} />
      </mesh>
      <group position={[0, lampHeight, 0]}>
        <mesh position={[0, .07, .038]} castShadow>
          <boxGeometry args={[.23, .12, .07]} />
          <meshStandardMaterial color="#79603f" metalness={.62} roughness={.43} />
        </mesh>
        <mesh position={[0, .06, .165]} castShadow>
          <boxGeometry args={[.07, .045, .22]} />
          <meshStandardMaterial color="#79603f" metalness={.62} roughness={.43} />
        </mesh>
        <mesh position={[0, .03, .29]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[.049, .049, lampWidth, 18]} />
          <meshStandardMaterial color="#9e7f51" metalness={.62} roughness={.36} />
        </mesh>
        <mesh position={[0, -.014, .29]}>
          <boxGeometry args={[lampWidth * .91, .012, .054]} />
          <meshBasicMaterial color="#fff0c8" toneMapped={false} />
        </mesh>
        <pointLight ref={lamp} position={[0, -.07, .34]} color="#ffebca" intensity={2.4} distance={2.5} />
      </group>
    </group>
  );
}

function Gallery({ images, onOpen, onReady, ...navigation }: SceneProps) {
  const [{ scene }, walker] = useLoader(GLTFLoader, galleryModels);
  const [destination, setDestination] = useState<Vector3 | null>(null);
  const actor = useRef<Group>(null);
  const onActor = useCallback((group: Group | null) => {
    actor.current = group;
  }, []);
  const daylight = useLoader(HDRLoader, daylightUrl);
  const sourceTextures = useLoader(TextureLoader, images);
  const textures = useMemo(() => sourceTextures.map((source) => {
    const texture = source.clone();
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }), [sourceTextures]);
  const invalidate = useThree((state) => state.invalidate);
  const canvas = useThree((state) => state.gl.domElement);
  const label = useMemo(() => createArtworkLabel(), []);
  const sunTarget = useMemo(() => new Object3D(), []);

  const { building, sky, environment, glassGeometries } = useMemo(() => {
    const building = scene.clone();
    const environment = daylight.clone();
    environment.mapping = EquirectangularReflectionMapping;
    const sky = new ShaderMaterial({
      uniforms: { daylight: { value: daylight } },
      vertexShader: `
        varying vec3 worldPosition;
        void main() {
          worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D daylight;
        varying vec3 worldPosition;
        #include <common>
        void main() {
          vec3 direction = normalize(worldPosition - cameraPosition);
          direction = normalize(vec3(direction.z, max(0.05, direction.y + 0.12), -direction.x));
          vec3 color = texture2D(daylight, equirectUv(direction)).rgb;
          gl_FragColor = vec4(color * 1.38 + vec3(0.08, 0.10, 0.13), 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
    });
    building.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
    });
    const glassGeometries = [];
    for (const [name, faces] of Object.entries(paneFaces)) {
      const mesh = building.getObjectByName(name);
      if (!(mesh instanceof Mesh) || Array.isArray(mesh.material) || !mesh.geometry.index) continue;
      const geometry = mesh.geometry.clone();
      const original: number[] = [];
      const panes: number[] = [];
      for (let i = 0; i < geometry.index.count; i += 3) {
        const indices = faces.has(i / 3) ? panes : original;
        indices.push(geometry.index.getX(i), geometry.index.getX(i + 1), geometry.index.getX(i + 2));
      }
      const paneGeometry = mesh.geometry.clone();
      geometry.setIndex(original);
      paneGeometry.setIndex(panes);
      mesh.geometry = geometry;
      mesh.add(new Mesh(paneGeometry, sky));
      glassGeometries.push(geometry, paneGeometry);
    }
    return { building, sky, environment, glassGeometries };
  }, [scene, daylight]);

  useEffect(() => () => {
    sky.dispose();
    environment.dispose();
    glassGeometries.forEach((geometry) => geometry.dispose());
  }, [sky, environment, glassGeometries]);

  useEffect(() => {
    invalidate();
    onReady();
  }, [invalidate, onReady]);

  useEffect(() => () => {
    textures.forEach((texture) => texture.dispose());
  }, [textures]);
  useEffect(() => () => label.dispose(), [label]);
  useEffect(() => {
    if (navigation.paused) canvas.removeAttribute("data-gallery-cursor");
  }, [canvas, navigation.paused]);

  return (
    <>
      <color attach="background" args={["#e7eef1"]} />
      <primitive object={environment} attach="environment" />
      <hemisphereLight args={["#fffaf2", "#f1e3d1", 1.62]} />
      <ambientLight intensity={.28} />
      <directionalLight position={[13, 10, -4]} color="#fff5e7" intensity={.68} />
      <primitive object={sunTarget} position={[4, 0, 1.4]} />
      <directionalLight position={[6.4, 16, -3.8]} target={sunTarget} color="#ffe8bf" intensity={2.05}
        castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-.00017} shadow-normalBias={.035}
        shadow-camera-left={-19} shadow-camera-right={19} shadow-camera-top={13} shadow-camera-bottom={-13}
        shadow-camera-near={1} shadow-camera-far={31} shadow-autoUpdate={false} shadow-needsUpdate />
      <WindowLight position={[3.4, 5.6, -1.65]} aim={[1.05, -.06, 3.4]} intensity={75} />
      <WindowLight position={[17.2, 5.3, -.6]} aim={[13.35, -2.2, 4.65]} intensity={92} />
      <WindowLight position={[20.1, 2.45, 1.25]} aim={[15.7, -2.2, .35]} intensity={54} />
      <primitive object={building}
        onPointerMove={(event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          if (isGalleryFloor(event.object.name)) canvas.setAttribute("data-gallery-cursor", "floor");
          else canvas.removeAttribute("data-gallery-cursor");
        }}
        onPointerOut={() => {
          if (canvas.dataset.galleryCursor === "floor") canvas.removeAttribute("data-gallery-cursor");
        }}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          if (event.delta < 8 && isGalleryFloor(event.object.name)) setDestination(event.point.clone());
        }} />
      {textures.map((texture, index) => (
        <ProjectArtwork key={images[index]} index={index} texture={texture} label={label}
          actor={actor} paused={navigation.paused} onOpen={onOpen} />
      ))}
      <GalleryWalker stops={stops} entrance={entrance} onActor={onActor} building={building} model={walker}
        destination={destination} {...navigation} />
    </>
  );
}

export default function ModernGalleryScene(props: SceneProps) {
  const { images } = props;
  useEffect(() => {
    useLoader.preload(HDRLoader, daylightUrl);
    useLoader.preload(TextureLoader, images);
  }, [images]);

  return (
    <Canvas camera={{ position: entrance.eye, fov: 57, near: .08, far: 80 }} shadows="percentage"
      scene={{ environmentIntensity: .5 }}
      gl={{ antialias: true, toneMapping: NeutralToneMapping, toneMappingExposure: 1.22 }}
      dpr={[1, 1.5]} fallback={null}>
      <Suspense fallback={null}><Gallery {...props} /></Suspense>
    </Canvas>
  );
}
