"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { AdditiveBlending, BackSide, CanvasTexture, MathUtils, PerspectiveCamera, Vector3, type Group, type ShaderMaterial } from "three";
import { constellations, type ConstellationButtons } from "./observatory-constellations";

type Catalog = {
  stars: [number, number, number, number][];
  segments: [number, number][];
};

const radius = 45;
const vertexShader = `
  attribute float magnitude;
  attribute float colorIndex;
  uniform float pixelRatio;
  varying vec3 tint;
  varying float brightness;
  void main() {
    float warmth = clamp((colorIndex + .25) / 1.65, 0., 1.);
    tint = mix(vec3(.69, .82, 1.), vec3(1., .78, .56), warmth);
    brightness = clamp(1.05 - magnitude * .113, .22, 1.);
    gl_PointSize = pixelRatio * clamp(4.85 - magnitude * .50, 1.25, 5.5);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
  }
`;

const fragmentShader = `
  varying vec3 tint;
  varying float brightness;
  void main() {
    float distanceToCenter = length(gl_PointCoord - vec2(.5));
    float spot = 1. - smoothstep(.12, .50, distanceToCenter);
    gl_FragColor = vec4(tint, spot * brightness);
  }
`;

function direction(ra: number, dec: number, distance: number) {
  const a = MathUtils.degToRad(ra);
  const d = MathUtils.degToRad(dec);
  return new Vector3(distance * Math.cos(d) * Math.cos(a), distance * Math.sin(d), -distance * Math.cos(d) * Math.sin(a));
}

const latitude = 37.5; // Seoul: Polaris sits this high above the northern rim
const introSeconds = 6.5;
const azimuths = { north: 0, east: 90, south: 180, west: 270 } as const;
export type SkyDirection = keyof typeof azimuths;

type SkyProps = {
  onIntroEnd: () => void;
  direction: SkyDirection;
  skipIntro: boolean;
  showConstellations: boolean;
  buttons: RefObject<ConstellationButtons>;
  onConstellationsReady: () => void;
};

// Faint alt-azimuth grid painted on the dome; it stays put while the sky turns.
function domeGrid() {
  const points: number[] = [];
  const at = (alt: number, az: number) => {
    const a = MathUtils.degToRad(alt);
    const z = MathUtils.degToRad(az);
    return [46 * Math.cos(a) * Math.sin(z), 46 * Math.sin(a), -46 * Math.cos(a) * Math.cos(z)];
  };
  for (let alt = 15; alt < 90; alt += 15) {
    for (let az = 0; az < 360; az += 5) points.push(...at(alt, az), ...at(alt, az + 5));
  }
  for (let az = 0; az < 360; az += 30) {
    for (let alt = 0; alt < 90; alt += 5) points.push(...at(alt, az), ...at(alt + 5, az));
  }
  return new Float32Array(points);
}

function coveGlow() {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 64;
  const context = canvas.getContext("2d")!;
  const gradient = context.createLinearGradient(0, 0, 0, 64);
  gradient.addColorStop(0, "rgba(255,190,120,0)");
  gradient.addColorStop(1, "rgba(255,190,120,.55)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1, 64);
  return new CanvasTexture(canvas);
}

function skyPoint(azimuth: number, altitude: number) {
  const az = MathUtils.degToRad(azimuth);
  const alt = MathUtils.degToRad(altitude);
  return new Vector3(Math.cos(alt) * Math.sin(az), Math.sin(alt), -Math.cos(alt) * Math.cos(az)).multiplyScalar(33);
}

function constellationGlow() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 32;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, "#fff");
    gradient.addColorStop(.28, "#ffffffe6");
    gradient.addColorStop(1, "#ffffff00");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
  }
  return new CanvasTexture(canvas);
}

function ConstellationMap({ buttons, onReady }: {
  buttons: RefObject<ConstellationButtons>;
  onReady: () => void;
}) {
  const projected = useRef(new Vector3());
  const announced = useRef(false);
  const spread = useThree(({ size }) => MathUtils.clamp(size.width / Math.max(size.height, 1) / .69, .48, 1));
  const glow = useMemo(() => constellationGlow(), []);
  const maps = useMemo(() => constellations.map(({ stars, lines, azimuth, altitude, ...style }) => {
    // Azimuth degrees narrow by cos(altitude) up the dome; widen offsets so shapes keep their proportions.
    const widen = 1 / Math.cos(MathUtils.degToRad(altitude));
    const nodes = stars.map(([az, alt]) => skyPoint((azimuth + az * widen) * spread, altitude + alt));
    const points = nodes.map((node) => node.toArray());
    return {
      ...style,
      nodes,
      anchor: skyPoint(azimuth * spread, altitude),
      positions: new Float32Array(points.flat()),
      edges: new Float32Array(lines.flatMap(([from, to]) => [...points[from], ...points[to]])),
    };
  }), [spread]);
  useEffect(() => () => glow.dispose(), [glow]);

  useFrame(({ camera, size }) => {
    camera.updateMatrixWorld();
    let visible = 0;
    for (const { id, anchor, nodes } of maps) {
      const button = buttons.current[id];
      if (!button) continue;
      const point = projected.current.copy(anchor).project(camera);
      if (point.z < -1 || point.z > 1 || Math.abs(point.x) > .93 || Math.abs(point.y) > .91) {
        button.setAttribute("data-visible", "false");
        continue;
      }
      let left = size.width;
      let right = 0;
      let top = size.height;
      let bottom = 0;
      for (const node of nodes) {
        const star = projected.current.copy(node).project(camera);
        const x = (star.x + 1) * size.width / 2;
        const y = (1 - star.y) * size.height / 2;
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
      button.style.setProperty("--sky-x", `${(left + right) / 2}px`);
      button.style.setProperty("--sky-y", `${Math.max(0, top - 9)}px`);
      button.style.setProperty("--sky-width", `${right - left + 20}px`);
      button.style.setProperty("--sky-height", `${bottom - top + 34}px`);
      button.setAttribute("data-visible", "true");
      visible++;
    }
    if (!announced.current && visible === maps.length) {
      announced.current = true;
      onReady();
    }
  });

  return maps.map(({ id, color, positions, edges }) => <group key={id}>
    <lineSegments>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[edges, 3]} /></bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={.76} depthWrite={false} />
    </lineSegments>
    <points>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial map={glow} color={color} size={.75} transparent depthWrite={false} blending={AdditiveBlending} />
    </points>
  </group>);
}

function Sky({
  catalog, onIntroEnd, direction: facing, skipIntro, showConstellations, buttons, onConstellationsReady,
}: SkyProps & { catalog: Catalog }) {
  const start = useRef<number | null>(null);
  const view = useRef({ azimuth: 0, altitude: MathUtils.degToRad(20) });
  const motion = useRef<MediaQueryList | null>(null);
  const pointsMaterial = useRef<ShaderMaterial>(null);
  const spin = useRef<Group>(null);
  const introDone = useRef(false);
  const invalidate = useThree((state) => state.invalidate);
  const grid = useMemo(() => domeGrid(), []);
  const glow = useMemo(() => coveGlow(), []);
  useEffect(() => () => glow.dispose(), [glow]);
  useEffect(() => {
    const idle = window.setInterval(() => {
      if (introDone.current && !motion.current?.matches && document.visibilityState === "visible") invalidate();
    }, 100);
    return () => window.clearInterval(idle);
  }, [invalidate]);
  const { coordinates, brightness, temperature, lines, uniforms } = useMemo(() => {
    const coordinates = new Float32Array(catalog.stars.length * 3);
    const brightness = new Float32Array(catalog.stars.length);
    const temperature = new Float32Array(catalog.stars.length);
    const lines = new Float32Array(catalog.segments.length * 6);
    catalog.stars.forEach(([ra, dec, magnitude, color], index) => {
      direction(ra, dec, radius).toArray(coordinates, index * 3);
      brightness[index] = magnitude;
      temperature[index] = color;
    });
    catalog.segments.forEach(([from, to], index) => {
      lines.set(coordinates.subarray(from * 3, from * 3 + 3), index * 6);
      lines.set(coordinates.subarray(to * 3, to * 3 + 3), index * 6 + 3);
    });
    return { coordinates, brightness, temperature, lines, uniforms: { pixelRatio: { value: 1 } } };
  }, [catalog]);

  useFrame(({ camera, clock, gl, invalidate }, delta) => {
    motion.current ??= window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduced = motion.current.matches;
    const time = clock.elapsedTime;
    start.current ??= time;
    // Opening: one full sweep around the dome rim while the gaze lifts, ending facing north.
    const progress = reduced || skipIntro ? 1 : Math.min(1, (time - start.current) / introSeconds);
    const cameraView = view.current;
    let turning = false;
    if (progress < 1) {
      const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      cameraView.azimuth = MathUtils.degToRad(360 * (1 - eased));
      cameraView.altitude = MathUtils.degToRad(20 + 10 * eased);
    } else {
      const target = MathUtils.degToRad(azimuths[facing]);
      const offset = MathUtils.euclideanModulo(target - cameraView.azimuth + Math.PI, 2 * Math.PI) - Math.PI;
      const altitude = MathUtils.degToRad(30);
      turning = !reduced && (Math.abs(offset) > .002 || Math.abs(cameraView.altitude - altitude) > .002);
      cameraView.azimuth = turning ? cameraView.azimuth + offset * (1 - Math.exp(-5 * Math.min(delta, .05))) : target;
      cameraView.altitude = turning ? MathUtils.damp(cameraView.altitude, altitude, 5, Math.min(delta, .05)) : altitude;
    }
    const { azimuth: az, altitude: alt } = cameraView;
    camera.lookAt(Math.cos(alt) * Math.sin(az), Math.sin(alt), -Math.cos(alt) * Math.cos(az));
    if (camera instanceof PerspectiveCamera && camera.fov !== 72) {
      camera.fov = 72;
      camera.updateProjectionMatrix();
    }
    if (progress === 1 && !introDone.current) {
      introDone.current = true;
      onIntroEnd();
    }
    if (spin.current && !reduced) spin.current.rotation.y += MathUtils.degToRad(.6) * Math.min(delta, .1);
    if (pointsMaterial.current) pointsMaterial.current.uniforms.pixelRatio.value = gl.getPixelRatio();
    if (!reduced && (!introDone.current || turning)) invalidate();
  });

  return <>
    <mesh>
      <sphereGeometry args={[44, 48, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      <meshBasicMaterial color="#04060f" side={BackSide} />
    </mesh>
    <mesh position={[0, 1.6, 0]}>
      <cylinderGeometry args={[43.6, 43.6, 3.2, 64, 1, true]} />
      <meshBasicMaterial map={glow} transparent side={BackSide} depthWrite={false} blending={AdditiveBlending} />
    </mesh>
    <lineSegments frustumCulled={false}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[grid, 3]} /></bufferGeometry>
      <lineBasicMaterial color="#8ea2d8" transparent opacity={.07} depthWrite={false} />
    </lineSegments>
    {/* Celestial pole tilted to Seoul's latitude; the inner group turns like a planetarium night. */}
    <group rotation={[-MathUtils.degToRad(90 - latitude), 0, 0]}><group ref={spin}>
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[coordinates, 3]} />
        <bufferAttribute attach="attributes-magnitude" args={[brightness, 1]} />
        <bufferAttribute attach="attributes-colorIndex" args={[temperature, 1]} />
      </bufferGeometry>
      <shaderMaterial ref={pointsMaterial} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} />
    </points>
    <lineSegments frustumCulled={false}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[lines, 3]} /></bufferGeometry>
      <lineBasicMaterial color="#9ab6ec" transparent opacity={.28} depthWrite={false} />
    </lineSegments>
    </group></group>
    {showConstellations && <ConstellationMap buttons={buttons} onReady={onConstellationsReady} />}
  </>;
}

export default function ObservatorySky(props: SkyProps) {
  const { onIntroEnd } = props;
  const [catalog, setCatalog] = useState<Catalog | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/sky/hyg-v41-bright-stars.json", { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<Catalog> : null)
      .then((data) => {
        if (controller.signal.aborted) return;
        if (data) setCatalog(data);
        else onIntroEnd(); // no sky to show: don't keep the room content waiting
      })
      .catch(() => { if (!controller.signal.aborted) onIntroEnd(); });
    return () => controller.abort();
  }, [onIntroEnd]);

  if (!catalog) return null;
  return (
    <Canvas camera={{ position: [0, 0, 0], near: .1, far: 85, fov: 72 }}
      frameloop="demand" dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }} fallback={null}>
      <Sky catalog={catalog} {...props} />
    </Canvas>
  );
}
