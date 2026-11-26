"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AnimationClip, AnimationMixer, CanvasTexture, Group, MathUtils,
  PerspectiveCamera, Quaternion, QuaternionKeyframeTrack,
  Vector3, VectorKeyframeTrack, type Object3D,
} from "three";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import { createGalleryNavigation } from "./gallery-navigation";

export const walkerUrl = "/project-media/gallery-nathan.glb";
type Point = [number, number, number];
type View = { eye: Point; target: Point };

const xAxis = new Vector3(1, 0, 0);
const walkSpeed = 1.65;
const keysByCode: Record<string, string> = {
  KeyW: "forward", ArrowUp: "forward", KeyS: "back", ArrowDown: "back",
  KeyA: "left", ArrowLeft: "left", KeyD: "right", ArrowRight: "right",
};

function placeAtStop(eye: Point, point: Vector3, floorAt: ReturnType<typeof createGalleryNavigation>["floorAt"]) {
  point.set(...eye);
  point.y = floorAt(point, -.42, 2.2) ?? point.y - 1.62;
}

function createContactShadow() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 32;
  const context = canvas.getContext("2d");
  if (context) {
    const falloff = context.createRadialGradient(16, 16, 1, 16, 16, 16);
    falloff.addColorStop(0, "#fff");
    falloff.addColorStop(.4, "#bbb");
    falloff.addColorStop(1, "#000");
    context.fillStyle = falloff;
    context.fillRect(0, 0, 32, 32);
  }
  return new CanvasTexture(canvas);
}

function createMotion(source: AnimationClip) {
  const walk = source.clone();
  const idleTracks = walk.tracks.map((track) => {
    const interpolant = track.InterpolantFactoryMethodLinear(new Float32Array(track.getValueSize()));
    // Take each planted leg from its own stance phase, then blend opposite strides for the torso.
    const planted = /_(upperleg|lowerleg|foot|ball|toe)_/.test(track.name);
    const time = planted ? (/_l_/.test(track.name) ? .50 : .01) : .33;
    const first = Array.from(interpolant.evaluate(time));
    const other = planted ? first : Array.from(interpolant.evaluate(.83));
    const root = track.name.includes("_root_01.position");

    if (track instanceof QuaternionKeyframeTrack) {
      const pose = new Quaternion().fromArray(first).slerp(new Quaternion().fromArray(other), .5);
      const breath = pose.clone();
      if (track.name.includes("_spine_02_")) {
        breath.multiply(new Quaternion().setFromAxisAngle(xAxis, .009));
      }
      return new QuaternionKeyframeTrack(track.name, [0, 2, 4], [...pose.toArray(), ...breath.toArray(), ...pose.toArray()]);
    }

    const pose = first.map((value, index) => (value + other[index]) * .5);
    if (root) {
      pose[2] = 0;
      for (let i = 2; i < track.values.length; i += 3) track.values[i] = 0;
    }
    return new VectorKeyframeTrack(track.name, [0, 4], [...pose, ...pose]);
  });
  return { walk, idle: new AnimationClip("Standing idle", 4, idleTracks) };
}

type WalkerProps = {
  stops: View[];
  building: Object3D;
  model: GLTF;
  startIndex: number;
  destination: Vector3 | null;
  exhibitRequest: { index: number } | null;
  paused: boolean;
  onExhibit: (index: number) => void;
};

export function GalleryWalker({ stops, building, model, startIndex, destination, exhibitRequest, paused, onExhibit }: WalkerProps) {
  const { scene, animations } = model;
  const { width, height } = useThree((state) => state.size);
  const getState = useThree((state) => state.get);
  const canvas = useThree((state) => state.gl.domElement);
  const actor = useRef<Group>(null);
  const avatar = useMemo(() => clone(scene), [scene]);
  const motion = useMemo(() => createMotion(animations[0]), [animations]);
  const navigation = useMemo(() => createGalleryNavigation(building), [building]);
  const contactShadow = useMemo(() => createContactShadow(), []);
  const targetMarker = useRef<Group>(null);
  const animation = useMemo(() => {
    const mixer = new AnimationMixer(avatar);
    return { mixer, idle: mixer.clipAction(motion.idle), walk: mixer.clipAction(motion.walk) };
  }, [avatar, motion]);
  const pressed = useRef(new Set<string>());
  const state = useRef({
    initialized: false, activeExhibit: startIndex, exhibitRequest,
    destination: null as Vector3 | null, path: [] as Vector3[], heading: 0, cameraHeading: 0,
    walking: false, pathStop: null as View | null,
  });
  const scratch = useRef({
    position: new Vector3(), sample: new Vector3(), direction: new Vector3(), aim: new Vector3(),
    eye: new Vector3(), idealEye: new Vector3(), cameraAnchor: new Vector3(), goal: new Vector3(),
  });

  useEffect(() => {
    animation.idle.play();
    return () => { animation.mixer.stopAllAction(); };
  }, [animation]);
  useEffect(() => () => contactShadow.dispose(), [contactShadow]);
  useEffect(() => {
    const { camera } = getState();
    if (!(camera instanceof PerspectiveCamera) || !width || !height) return;
    const portraitFov = MathUtils.radToDeg(2 * Math.atan(Math.tan(MathUtils.degToRad(24)) * height / width));
    camera.fov = Math.min(94, Math.max(57, portraitFov));
    camera.updateProjectionMatrix();
  }, [getState, width, height]);

  useEffect(() => {
    const held = pressed.current;
    const codeFor = (event: KeyboardEvent) => [event.code, "Key" + event.key.toUpperCase(), event.key]
      .find((code) => Object.hasOwn(keysByCode, code));
    const clear = () => held.clear();
    clear();
    if (paused) return;

    function keyDown(event: KeyboardEvent) {
      const code = codeFor(event);
      if (!code || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        event.isComposing || (event.target instanceof Element &&
          event.target.closest("input, textarea, select, [contenteditable], dialog"))) return;
      const bounds = canvas.getBoundingClientRect();
      const visible = Math.min(bounds.bottom, window.innerHeight) - Math.max(0, bounds.top);
      if (!canvas.isConnected || visible < bounds.height * .75 || bounds.height === 0) return;
      event.preventDefault();
      held.add(code);
    }

    function keyUp(event: KeyboardEvent) {
      const code = codeFor(event);
      if (code) held.delete(code);
    }
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", clear);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", clear);
      clear();
    };
  }, [canvas, paused]);

  useFrame(({ camera }, elapsed) => {
    if (!actor.current || paused) return;
    const dt = Math.min(elapsed, .075);
    const current = state.current;
    const { position, sample, direction, aim, eye, idealEye, cameraAnchor, goal } = scratch.current;
    let targetHeading = current.heading;
    let viewHeading = current.cameraHeading;
    let walkingDistance = 0;
    const has = (move: string) => {
      for (const code of pressed.current) {
        if (keysByCode[code] === move) return true;
      }
      return false;
    };
    const forward = Number(has("forward")) - Number(has("back"));
    const strafe = Number(has("left")) - Number(has("right"));

    if (!current.initialized) {
      const stop = stops[current.activeExhibit];
      placeAtStop(stop.eye, position, navigation.floorAt);
      targetHeading = viewHeading = Math.atan2(stop.target[0] - position.x, stop.target[2] - position.z);
    }

    if (destination !== current.destination || exhibitRequest !== current.exhibitRequest) {
      current.pathStop = exhibitRequest && exhibitRequest !== current.exhibitRequest ? stops[exhibitRequest.index] : null;
      current.destination = destination;
      current.exhibitRequest = exhibitRequest;
      if (current.pathStop) placeAtStop(current.pathStop.eye, goal, navigation.floorAt);
      else if (destination) goal.copy(destination);
      current.path = current.pathStop || destination ? navigation.findPath(position, goal) : [];
    }

    if (forward || strafe) {
      current.path = [];
      current.pathStop = null;
      const angle = current.cameraHeading;
      direction.set(Math.sin(angle) * forward + Math.cos(angle) * strafe, 0,
        Math.cos(angle) * forward - Math.sin(angle) * strafe).normalize();
      const distance = dt * walkSpeed * (forward < 0 && !strafe ? .7 : 1);
      sample.copy(position).addScaledVector(direction, distance);
      const floor = navigation.step(position, sample);
      if (floor !== undefined) {
        position.set(sample.x, floor, sample.z);
        const backwards = forward < 0 && !strafe;
        targetHeading = backwards ? angle : Math.atan2(direction.x, direction.z);
        walkingDistance = backwards ? -distance : distance;
      }
    } else if (current.path.length) {
      const next = current.path[0];
      direction.set(next.x - position.x, 0, next.z - position.z);
      const remaining = direction.length();
      if (remaining < .0001) {
        current.path.shift();
        if (!current.path.length && current.pathStop) {
          const [x, , z] = current.pathStop.target;
          targetHeading = viewHeading = Math.atan2(x - position.x, z - position.z);
        }
      } else {
        const distance = Math.min(remaining, dt * walkSpeed);
        direction.divideScalar(remaining);
        sample.copy(position).addScaledVector(direction, distance);
        const floor = navigation.step(position, sample);
        if (floor === undefined) {
          current.path = [];
        } else {
          position.set(sample.x, floor, sample.z);
          targetHeading = viewHeading = Math.atan2(direction.x, direction.z);
          walkingDistance = distance;
        }
      }
    } else if (current.pathStop) {
      const [x, , z] = current.pathStop.target;
      targetHeading = viewHeading = Math.atan2(x - position.x, z - position.z);
    }

    const nearest = stops.reduce((best, stop, index) => {
      const distance = (view: View) => Math.hypot(view.eye[0] - position.x, view.eye[1] - 1.62 - position.y, view.eye[2] - position.z);
      return distance(stop) < distance(stops[best]) ? index : best;
    }, 0);
    if (nearest !== current.activeExhibit) {
      current.activeExhibit = nearest;
      onExhibit(nearest);
    }

    if (targetMarker.current) {
      const last = current.path[current.path.length - 1];
      targetMarker.current.visible = !!last && !current.pathStop;
      if (last) targetMarker.current.position.set(last.x, last.y + .028, last.z);
    }

    const snap = !current.initialized;
    const dampAngle = (from: number, to: number, rate: number) => snap ? to
      : from + (MathUtils.euclideanModulo(to - from + Math.PI, 2 * Math.PI) - Math.PI) * (1 - Math.exp(-rate * dt));
    current.heading = dampAngle(current.heading, targetHeading, 12);
    current.cameraHeading = dampAngle(current.cameraHeading, viewHeading, 7);
    actor.current.position.copy(position);
    actor.current.rotation.y = current.heading;

    const walking = Math.abs(walkingDistance) > dt * .16;
    if (walking !== current.walking) {
      const from = walking ? animation.idle : animation.walk;
      const to = walking ? animation.walk : animation.idle;
      to.reset().setEffectiveWeight(1).play();
      from.crossFadeTo(to, .22, false);
      current.walking = walking;
    }
    if (walking) {
      const speed = MathUtils.clamp(Math.abs(walkingDistance) / Math.max(dt, .001) / walkSpeed, .65, 2.1);
      animation.walk.setEffectiveTimeScale(speed * Math.sign(walkingDistance));
    }
    animation.mixer.update(dt);

    const heading = current.cameraHeading;
    const forwardX = Math.sin(heading);
    const forwardZ = Math.cos(heading);
    cameraAnchor.set(position.x, position.y + 1.36, position.z);
    idealEye.set(position.x - forwardX * 3.1 - forwardZ * .28, position.y + 2.48, position.z - forwardZ * 3.1 + forwardX * .28);
    direction.copy(idealEye).sub(cameraAnchor);
    const eyeDistance = direction.length();
    direction.divideScalar(eyeDistance);
    const obstruction = navigation.cameraDistance(cameraAnchor, direction, eyeDistance + .16);
    const safeDistance = obstruction === undefined ? eyeDistance : Math.max(.12, obstruction - .16);
    idealEye.copy(cameraAnchor).addScaledVector(direction, safeDistance);
    eye.copy(idealEye);
    if (!snap && !obstruction) eye.y = MathUtils.damp(camera.position.y, idealEye.y, 14, dt);
    camera.position.copy(eye);
    const lookAhead = obstruction === undefined ? 2.1 : 1.45;
    aim.set(position.x + forwardX * lookAhead, position.y + (obstruction === undefined ? .84 : 1.22),
      position.z + forwardZ * lookAhead);
    camera.lookAt(aim);
    actor.current.visible = safeDistance > .53;
    current.initialized = true;
  });

  return <>
    <group ref={actor}>
      <primitive object={avatar} scale={.01} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .015, 0]}>
        <planeGeometry args={[.85, .85]} />
        <meshBasicMaterial color="#221b15" alphaMap={contactShadow} transparent opacity={.31} depthWrite={false} />
      </mesh>
    </group>
    <group ref={targetMarker} visible={false} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <ringGeometry args={[.16, .21, 36]} />
        <meshBasicMaterial color="#84572d" transparent opacity={.8} depthWrite={false} />
      </mesh>
    </group>
  </>;
}
