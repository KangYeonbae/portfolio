"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  AnimationClip, AnimationMixer, CanvasTexture, Group, MathUtils,
  PerspectiveCamera, Quaternion, QuaternionKeyframeTrack, SkinnedMesh,
  Vector3, VectorKeyframeTrack, type Object3D,
} from "three";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import { createGalleryNavigation } from "./gallery-navigation";

type Point = [number, number, number];
type View = { eye: Point; target: Point };

const xAxis = new Vector3(1, 0, 0);
const walkSpeed = 1.65;
const initialZoom = 3.3;
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
  entrance: View;
  onActor: (group: Group | null) => void;
  building: Object3D;
  model: GLTF;
  startIndex: number;
  destination: Vector3 | null;
  exhibitRequest: { index: number } | null;
  paused: boolean;
  onExhibit: (index: number) => void;
};

export function GalleryWalker({ stops, entrance, onActor, building, model, startIndex, destination, exhibitRequest, paused, onExhibit }: WalkerProps) {
  const { scene, animations } = model;
  const { width, height } = useThree((state) => state.size);
  const canvas = useThree((state) => state.gl.domElement);
  const invalidate = useThree((state) => state.invalidate);
  const aspect = width / Math.max(height, 1);
  const portraitFov = MathUtils.radToDeg(2 * Math.atan(Math.tan(MathUtils.degToRad(24)) / Math.max(aspect, .01)));
  const baseFov = Math.min(94, Math.max(57, portraitFov));
  const actor = useRef<Group>(null);
  const mountActor = useCallback((group: Group | null) => {
    actor.current = group;
    onActor(group);
  }, [onActor]);
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
  const cameraInput = useRef({ zoom: initialZoom, yaw: 0, pitch: 0 });
  const state = useRef({
    initialized: false, activeExhibit: startIndex, exhibitRequest,
    destination: null as Vector3 | null, path: [] as Vector3[], heading: 0, cameraHeading: 0,
    walking: false, pathStop: null as View | null,
    cameraFloor: 0, cameraArm: initialZoom, zoom: initialZoom, orbitYaw: 0, orbitPitch: 0,
  });
  const scratch = useRef({
    position: new Vector3(), sample: new Vector3(), direction: new Vector3(), aim: new Vector3(),
    cameraAnchor: new Vector3(), goal: new Vector3(),
  });

  useEffect(() => {
    animation.idle.play();
    return () => {
      animation.mixer.stopAllAction();
      animation.mixer.uncacheRoot(avatar);
      avatar.traverse((object) => {
        if (object instanceof SkinnedMesh) object.skeleton.dispose();
      });
    };
  }, [animation, avatar]);
  useEffect(() => () => contactShadow.dispose(), [contactShadow]);
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
      invalidate();
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
  }, [canvas, invalidate, paused]);

  useEffect(() => {
    if (paused) return;
    let pointer: { id: number; x: number; y: number } | null = null;
    function wheel(event: WheelEvent) {
      if (event.ctrlKey || event.metaKey || event.deltaY === 0) return;
      event.preventDefault();
      const pixels = event.deltaMode === 1 ? event.deltaY * 16
        : event.deltaMode === 2 ? event.deltaY * canvas.clientHeight : event.deltaY;
      const input = cameraInput.current;
      input.zoom = MathUtils.clamp(input.zoom + pixels * .004, 2.25, 6.5);
      invalidate();
    }
    function pointerDown(event: PointerEvent) {
      if (event.button !== 2) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
      canvas.dataset.orbiting = "";
    }
    function pointerMove(event: PointerEvent) {
      if (pointer?.id !== event.pointerId) return;
      const input = cameraInput.current;
      input.yaw = MathUtils.euclideanModulo(input.yaw - (event.clientX - pointer.x) * .006 + Math.PI, Math.PI * 2) - Math.PI;
      input.pitch = MathUtils.clamp(input.pitch + (event.clientY - pointer.y) * .005, -.23, .56);
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      invalidate();
    }
    function endDrag(event?: PointerEvent) {
      if (!pointer || (event && pointer.id !== event.pointerId)) return;
      const id = pointer.id;
      pointer = null;
      delete canvas.dataset.orbiting;
      if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
    }
    const hideMenu = (event: MouseEvent) => event.preventDefault();
    canvas.addEventListener("wheel", wheel, { passive: false });
    canvas.addEventListener("pointerdown", pointerDown);
    canvas.addEventListener("pointermove", pointerMove);
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
    canvas.addEventListener("lostpointercapture", endDrag);
    canvas.addEventListener("contextmenu", hideMenu);
    return () => {
      endDrag();
      canvas.removeEventListener("wheel", wheel);
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerup", endDrag);
      canvas.removeEventListener("pointercancel", endDrag);
      canvas.removeEventListener("lostpointercapture", endDrag);
      canvas.removeEventListener("contextmenu", hideMenu);
    };
  }, [canvas, invalidate, paused]);

  useFrame(({ camera }, elapsed) => {
    if (!actor.current || paused) return;
    const dt = Math.min(elapsed, .075);
    const current = state.current;
    const { position, sample, direction, aim, cameraAnchor, goal } = scratch.current;
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
      const stop = current.activeExhibit === 0 ? entrance : stops[current.activeExhibit];
      placeAtStop(stop.eye, position, navigation.floorAt);
      targetHeading = viewHeading = Math.atan2(stop.target[0] - position.x, stop.target[2] - position.z);
      if (stop === entrance) {
        viewHeading -= .6 * (1 - MathUtils.smoothstep(aspect, .56, .95));
        targetHeading = viewHeading;
      }
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
      const angle = current.cameraHeading + current.orbitYaw;
      direction.set(Math.sin(angle) * forward + Math.cos(angle) * strafe, 0,
        Math.cos(angle) * forward - Math.sin(angle) * strafe).normalize();
      const distance = dt * walkSpeed;
      sample.copy(position).addScaledVector(direction, distance);
      const floor = navigation.step(position, sample);
      if (floor !== undefined) {
        position.set(sample.x, floor, sample.z);
        targetHeading = Math.atan2(direction.x, direction.z);
        walkingDistance = distance;
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
    current.heading = dampAngle(current.heading, targetHeading, 15);
    current.cameraHeading = dampAngle(current.cameraHeading, viewHeading, 4.8);
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
      animation.walk.setEffectiveTimeScale(speed);
    }
    animation.mixer.update(dt);

    const input = cameraInput.current;
    current.cameraFloor = snap ? position.y : MathUtils.damp(current.cameraFloor, position.y, 5.2, dt);
    current.orbitYaw = dampAngle(current.orbitYaw, input.yaw, 17);
    current.orbitPitch = MathUtils.damp(current.orbitPitch, input.pitch, 17, dt);
    current.zoom = MathUtils.damp(current.zoom, input.zoom, 9, dt);
    const heading = current.cameraHeading + current.orbitYaw;
    const forwardX = Math.sin(heading);
    const forwardZ = Math.cos(heading);
    const tilt = .346 + current.orbitPitch;
    const horizontal = Math.cos(tilt) * current.zoom;
    cameraAnchor.set(position.x, current.cameraFloor + 1.36, position.z);
    direction.set(-forwardX * horizontal - forwardZ * .28, Math.sin(tilt) * current.zoom,
      -forwardZ * horizontal + forwardX * .28);
    const eyeDistance = direction.length();
    direction.divideScalar(eyeDistance);
    const obstruction = navigation.cameraDistance(cameraAnchor, direction, eyeDistance + .45);
    const targetArm = Math.min(eyeDistance, Math.max(.12, (obstruction ?? Infinity) - .42));
    current.cameraArm = snap ? targetArm
      : MathUtils.damp(current.cameraArm, targetArm, targetArm < current.cameraArm ? 15 : 5.5, dt);
    const safeDistance = Math.min(current.cameraArm, Math.max(.12, (obstruction ?? Infinity) - .12));
    camera.position.copy(cameraAnchor).addScaledVector(direction, safeDistance);
    if (camera instanceof PerspectiveCamera) {
      const constrainedZoom = Math.max(0, Math.min(current.zoom - initialZoom, eyeDistance - safeDistance));
      const fov = Math.min(105, baseFov + constrainedZoom * 6);
      if (Math.abs(camera.fov - fov) > .02) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
    }
    const framing = MathUtils.smoothstep(safeDistance, .55, initialZoom);
    const lookAhead = MathUtils.lerp(.85, 2.1, framing);
    aim.set(position.x + forwardX * lookAhead, current.cameraFloor + MathUtils.lerp(1.25, .84, framing),
      position.z + forwardZ * lookAhead);
    camera.lookAt(aim);
    actor.current.visible = safeDistance > .53;
    current.initialized = true;
    if (pressed.current.size || current.path.length || Math.abs(current.zoom - input.zoom) > .003 ||
      Math.abs(current.orbitPitch - input.pitch) > .003 || Math.abs(current.cameraFloor - position.y) > .003 ||
      Math.abs(current.cameraArm - targetArm) > .003 ||
      1 - Math.cos(current.cameraHeading - viewHeading) > .0001 ||
      1 - Math.cos(current.orbitYaw - input.yaw) > .0001) invalidate();
  });

  return <>
    <group ref={mountActor}>
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
