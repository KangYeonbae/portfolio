"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdditiveBlending, BackSide, CanvasTexture, MathUtils, PerspectiveCamera, Vector3, type Group, type ShaderMaterial } from "three";

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

function Sky({ catalog, onIntroEnd }: { catalog: Catalog; onIntroEnd: () => void }) {
  const start = useRef<number | null>(null);
  const motion = useRef<MediaQueryList | null>(null);
  const pointsMaterial = useRef<ShaderMaterial>(null);
  const spin = useRef<Group>(null);
  const introDone = useRef(false);
  const grid = useMemo(() => domeGrid(), []);
  const glow = useMemo(() => coveGlow(), []);
  useEffect(() => () => glow.dispose(), [glow]);
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
    const progress = reduced ? 1 : Math.min(1, (time - start.current) / introSeconds);
    const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
    const az = MathUtils.degToRad(360 * (1 - eased));
    const alt = MathUtils.degToRad(20 + 10 * eased);
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
    if (!reduced) invalidate();
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
  </>;
}

export default function ObservatorySky({ onIntroEnd }: { onIntroEnd: () => void }) {
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
      <Sky catalog={catalog} onIntroEnd={onIntroEnd} />
    </Canvas>
  );
}
