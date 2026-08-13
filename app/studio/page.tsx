import type { Metadata } from "next";
import { Studio } from "@/components/studio";

export const metadata: Metadata = { title: "Content Studio — 강연배", robots: { index: false, follow: false } };

export default function StudioPage() { return <Studio />; }
