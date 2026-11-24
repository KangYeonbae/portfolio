"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { MathUtils, PerspectiveCamera, Vector3, type ShaderMaterial } from "three";

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

function Sky({ catalog }: { catalog: Catalog }) {
  const start = useRef<number | null>(null);
  const motion = useRef<MediaQueryList | null>(null);
  const pointsMaterial = useRef<ShaderMaterial>(null);
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

  useFrame(({ camera, clock, gl, invalidate, size }) => {
    motion.current ??= window.matchMedia("(prefers-reduced-motion: reduce)");
    const time = clock.elapsedTime;
    start.current ??= time;
    const progress = motion.current.matches ? 1 : Math.min(1, (time - start.current) / 1.8);
    const eased = 1 - (1 - progress) ** 3;
    const targetRa = size.width < 750 ? 91 : 101;
    camera.lookAt(direction(targetRa + 36 * (1 - eased), -2 + 13 * (1 - eased), 1));
    if (camera instanceof PerspectiveCamera) {
      camera.fov = 47 + 12 * (1 - eased);
      camera.updateProjectionMatrix();
    }
    if (pointsMaterial.current) pointsMaterial.current.uniforms.pixelRatio.value = gl.getPixelRatio();
    if (progress < 1) invalidate();
  });

  return <>
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
  </>;
}

export default function ObservatorySky() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/sky/hyg-v41-bright-stars.json", { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<Catalog> : null)
      .then((data) => { if (data && !controller.signal.aborted) setCatalog(data); })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  if (!catalog) return null;
  return (
    <Canvas camera={{ position: [0, 0, 0], near: .1, far: 85, fov: 59 }}
      frameloop="demand" dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }} fallback={null}>
      <Sky catalog={catalog} />
    </Canvas>
  );
}
