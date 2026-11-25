"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import styles from "./experience.module.css";

const modelId = "feb9ad17e042418c8e759b81e3b2e5d7";
type Point = [number, number, number];

// Sketchfab uses Z for height. These views were tested inside the museum scan.
const views: { eye: Point; target: Point }[] = [
  { eye: [-8.48, -10.34, 4.6], target: [0, 2.8, 4.6] },
  { eye: [-6.18, 6.39, 5.51], target: [-5.14, 5.22, 5.52] },
  { eye: [2.11, 2.36, 4.9], target: [.25, 3.4, 4.91] },
  { eye: [5.63, 2.68, 4.91], target: [7.01, 5.04, 4.92] },
];

type Viewer = {
  start(): void;
  addEventListener(event: "viewerready", callback: () => void): void;
  addEventListener(event: "textureLoadProgress", callback: (progress: number) => void): void;
  setEnableCameraConstraints(enabled: boolean): void;
  setFov(angle: number): void;
  setCameraLookAt(eye: Point, target: Point, seconds: number, callback: (error: unknown) => void): void;
  getAnnotationList(callback: (error: unknown, annotations: unknown[]) => void): void;
  hideAnnotation(index: number): void;
};

type SketchfabConstructor = new (frame: HTMLIFrameElement) => {
  init(model: string, options: {
    camera: number;
    ui_hint: number;
    ui_annotations: number;
    success: (viewer: Viewer) => void;
    error: () => void;
  }): void;
};

export function MuseumViewer({ active, reduced }: { active: number; reduced: boolean }) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const initialized = useRef(false);
  const cameraPositioned = useRef(false);
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [ready, setReady] = useState(false);
  const [texturesReady, setTexturesReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const visible = ready && texturesReady;

  useEffect(() => {
    if (visible || failed) return;
    const timeout = window.setTimeout(() => setFailed(true), 30000);
    return () => window.clearTimeout(timeout);
  }, [visible, failed]);

  useEffect(() => {
    if (!ready || texturesReady) return;
    // Some viewer sessions skip the texture progress event for cached textures.
    const timeout = window.setTimeout(() => setTexturesReady(true), 5000);
    return () => window.clearTimeout(timeout);
  }, [ready, texturesReady]);

  useEffect(() => {
    if (!viewer) return;
    const { eye, target } = views[active];
    const duration = cameraPositioned.current && !reduced ? .95 : 0;
    viewer.setCameraLookAt(eye, target, duration, (error) => {
      if (error) return;
      cameraPositioned.current = true;
      setReady(true);
    });
  }, [viewer, active, reduced]);

  function connect() {
    const frame = iframe.current;
    if (!frame || initialized.current) return;
    const Sketchfab = (window as Window & { Sketchfab?: SketchfabConstructor }).Sketchfab;
    if (!Sketchfab) {
      setFailed(true);
      return;
    }
    initialized.current = true;

    new Sketchfab(frame).init(modelId, {
      camera: 0,
      ui_hint: 0,
      ui_annotations: 0,
      error: () => { if (frame.isConnected) setFailed(true); },
      success(api) {
        api.addEventListener("textureLoadProgress", (progress) => {
          if (progress >= 1 && frame.isConnected) setTexturesReady(true);
        });
        api.addEventListener("viewerready", () => {
          if (!frame.isConnected) return;
          api.setEnableCameraConstraints(false);
          api.setFov(53);
          api.getAnnotationList((error, annotations) => {
            if (!error) annotations.forEach((_, index) => api.hideAnnotation(index));
          });
          setViewer(api);
        });
        api.start();
      },
    });
  }

  return (
    <>
      <Script src="https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js" onReady={connect}
        onError={() => setFailed(true)} />
      <iframe ref={iframe} title="할빌 박물관 응접실 3D 모델" tabIndex={-1} aria-hidden="true"
        data-ready={visible} allow="autoplay" />
      {!visible && (
        <p className={styles.museumViewerStatus} role="status">
          {failed ? "이 브라우저에서는 3D를 실행할 수 없어 사진을 표시합니다." : "박물관 3D 모델을 불러오는 중입니다."}
        </p>
      )}
    </>
  );
}
