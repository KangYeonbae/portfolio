"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import upwardPortrait from "@/public/portrait/gaze-up.png";
import type { createPortraitMorph } from "./portrait-morph";
import styles from "./experience.module.css";

const sizes = "(max-width: 800px) 190px, 320px";
const motionQuery = "(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)";
const poses = [
  ["up-left", "up", "up-right"],
  ["left", "center", "right"],
  ["down-left", "down", "down-right"],
] as const;

type Pose = (typeof poses)[number][number];
type Axis = -1 | 0 | 1;

function axisPosition(value: number, previous: Axis): Axis {
  if (value < (previous === -1 ? -0.2 : -0.29)) return -1;
  if (value > (previous === 1 ? 0.2 : 0.29)) return 1;
  return 0;
}

export function InteractivePortrait() {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const morph = useRef<ReturnType<typeof createPortraitMorph> | null>(null);
  const gaze = useRef({ x: 0, y: 0 });
  const [pose, setPose] = useState<Pose>("center");
  const [loadAngles, setLoadAngles] = useState(false);
  const [following, setFollowing] = useState(true);
  const [morphReady, setMorphReady] = useState(false);

  useEffect(() => {
    const portrait = frameRef.current;
    const canvas = canvasRef.current;
    if (!loadAngles || !portrait || !canvas) return;

    const images = poses.flat().map((angle) =>
      portrait.querySelector<HTMLImageElement>("[data-portrait-source=" + angle + "]"));
    if (images.some((image) => image === null)) return;

    const controller = new AbortController();
    const snapshots = images.filter((image) => image !== null);
    const fallback = () => {
      setMorphReady(false);
      morph.current = null;
    };
    let preview: ReturnType<typeof createPortraitMorph> | undefined;
    let bitmaps: ImageBitmap[] = [];

    async function loadMorph(surface: HTMLCanvasElement) {
      const [{ createPortraitMorph }, response] = await Promise.all([
        import("./portrait-morph"),
        fetch("/portrait/gaze-flow.bin", { signal: controller.signal }),
        Promise.all(snapshots.map((image) => image.decode())),
      ]);
      if (!response.ok) return;
      const flow = await response.arrayBuffer();
      if (controller.signal.aborted) return;

      // ImageBitmap gives WebGL the decoded size, independent of the image's responsive layout.
      const decoded = await Promise.allSettled(snapshots.map((image) => createImageBitmap(image)));
      bitmaps = decoded.flatMap((image) => image.status === "fulfilled" ? [image.value] : []);
      if (controller.signal.aborted || bitmaps.length !== snapshots.length) {
        bitmaps.forEach((image) => image.close());
        bitmaps = [];
        return;
      }

      preview = createPortraitMorph(surface, bitmaps, flow);
      preview.draw(gaze.current.x, gaze.current.y);
      morph.current = preview;
      setMorphReady(true);
    }

    canvas.addEventListener("webglcontextlost", fallback);
    void loadMorph(canvas).catch(() => {
      if (!controller.signal.aborted) fallback();
    });
    return () => {
      controller.abort();
      canvas.removeEventListener("webglcontextlost", fallback);
      morph.current = null;
      preview?.dispose();
      bitmaps.forEach((image) => image.close());
    };
  }, [loadAngles]);

  useEffect(() => {
    const portrait = frameRef.current;
    if (!portrait || !following) return;

    const motion = window.matchMedia(motionQuery);
    let visible = false;
    let started = false;
    let pointer: { x: number; y: number } | null = null;
    let animation = 0;
    let lastTime = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let column: Axis = 0;
    let row: Axis = 0;

    function animate(time: number) {
      const blend = 1 - Math.exp(-Math.min(time - lastTime, 50) / 125);
      lastTime = time;
      currentX += (targetX - currentX) * blend;
      currentY += (targetY - currentY) * blend;
      gaze.current = { x: currentX, y: currentY };
      morph.current?.draw(currentX, currentY);
      const nextColumn = axisPosition(currentX, column);
      const nextRow = axisPosition(currentY, row);
      if (nextColumn !== column || nextRow !== row) {
        column = nextColumn;
        row = nextRow;
        setPose(poses[row + 1][column + 1]);
      }

      const remaining = Math.max(Math.abs(targetX - currentX), Math.abs(targetY - currentY));
      animation = remaining > 0.005 ? requestAnimationFrame(animate) : 0;
    }

    function aimAt(x: number, y: number) {
      targetX = Math.max(-1, Math.min(1, x));
      targetY = Math.max(-1, Math.min(1, y));
      if (animation) return;
      lastTime = performance.now();
      animation = requestAnimationFrame(animate);
    }

    function syncGaze() {
      if (!portrait || !pointer || !visible || !motion.matches) return;
      const { left, top, width, height } = portrait.getBoundingClientRect();
      // Aim from eye level in the photo, even when the pointer is over the page copy.
      aimAt((pointer.x - left - width / 2) / (width * 0.8), (pointer.y - top - height * 0.36) / (height * 0.65));
    }

    function followPointer(event: PointerEvent) {
      if (!visible || !motion.matches || event.pointerType !== "mouse") return;
      if (!started) {
        started = true;
        setLoadAngles(true);
      }
      pointer = { x: event.clientX, y: event.clientY };
      syncGaze();
    }

    function leaveWindow(event: PointerEvent) {
      if (event.relatedTarget !== null) return;
      pointer = null;
      if (visible && motion.matches) aimAt(0, 0);
    }

    function reset() {
      cancelAnimationFrame(animation);
      animation = 0;
      pointer = null;
      targetX = currentX = 0;
      targetY = currentY = 0;
      column = row = 0;
      gaze.current = { x: 0, y: 0 };
      morph.current?.draw(0, 0);
      setPose("center");
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.intersectionRatio >= 0.45;
      if (!visible) reset();
    }, { threshold: 0.45 });
    observer.observe(portrait);
    window.addEventListener("pointermove", followPointer, { passive: true });
    window.addEventListener("pointerout", leaveWindow);
    window.addEventListener("scroll", syncGaze, { passive: true });
    window.addEventListener("blur", reset);
    motion.addEventListener("change", reset);
    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", followPointer);
      window.removeEventListener("pointerout", leaveWindow);
      window.removeEventListener("scroll", syncGaze);
      window.removeEventListener("blur", reset);
      motion.removeEventListener("change", reset);
      cancelAnimationFrame(animation);
    };
  }, [following]);

  return (
    <figure className={styles.portraitArea}>
      <div className={styles.portraitFrame} ref={frameRef} data-gaze={pose} data-following={following}>
        <Image
          src="/portrait/front.jpg"
          alt="강연배 프로필 사진"
          fill
          loading="eager"
          fetchPriority="high"
          sizes={sizes}
          className={styles.portraitImage}
          data-portrait-source="center"
        />
        {loadAngles && poses.flat().filter((angle) => angle !== "center").map((angle) => (
          <Image
            key={angle}
            src={angle === "up" ? upwardPortrait : "/portrait/gaze-" + angle + ".png"}
            alt=""
            fill
            sizes={sizes}
            onLoad={({ currentTarget }) => { currentTarget.dataset.ready = "true"; }}
            data-angle={angle}
            data-portrait-source={angle}
            data-active={angle === pose}
            className={styles.portraitAngle}
          />
        ))}
        {loadAngles && (
          <canvas
            ref={canvasRef}
            className={styles.portraitMorph}
            data-ready={morphReady}
            aria-hidden="true"
          />
        )}
      </div>
      <figcaption className={styles.portraitCaption}>
        <span>KANG YEONBAE / AI PRODUCT ENGINEER</span>
        <button
          type="button"
          className={styles.portraitToggle}
          aria-pressed={following}
          onClick={() => {
            if (following) {
              setPose("center");
              gaze.current = { x: 0, y: 0 };
              morph.current?.draw(0, 0);
            }
            setFollowing(!following);
          }}
        >
          <span className={styles.toggleTrack} aria-hidden="true" />
          시선 따라가기
        </button>
      </figcaption>
    </figure>
  );
}
