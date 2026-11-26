"use client";

import { useEffect, useRef } from "react";

export function ProjectVideo({ src, poster }: { src: string; poster?: string }) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    element.src = src;
    return () => {
      element.pause();
      element.removeAttribute("src");
      element.load();
    };
  }, [src]);

  return <video ref={video} controls playsInline preload="none" poster={poster}>
    브라우저가 영상을 지원하지 않습니다.
  </video>;
}
