import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function ArrowUpRight(props: IconProps) {
  return <svg {...base} {...props}><path d="M7 17 17 7M7 7h10v10" /></svg>;
}

export function ArrowRight(props: IconProps) {
  return <svg {...base} {...props}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

export function Github(props: IconProps) {
  return <svg {...base} {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7A5.4 5.4 0 0 0 19.4 4 5 5 0 0 0 19.3.5S18.2.1 15 1.8a13.4 13.4 0 0 0-6 0C5.8.1 4.7.5 4.7.5A5 5 0 0 0 4.6 4a5.4 5.4 0 0 0-1.4 3.7c0 5.4 3.5 6.6 6.8 7A4.8 4.8 0 0 0 9 18v4" /><path d="M9 19c-3 .9-3-1.5-4-2" /></svg>;
}

export function Linkedin(props: IconProps) {
  return <svg {...base} {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><path d="M2 9h4v12H2z" /><path d="M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /></svg>;
}

export function Mail(props: IconProps) {
  return <svg {...base} {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
}

export function Search(props: IconProps) {
  return <svg {...base} {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
}

export function Pen(props: IconProps) {
  return <svg {...base} {...props}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg>;
}

export function Menu(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}

export function Close(props: IconProps) {
  return <svg {...base} {...props}><path d="m6 6 12 12M18 6 6 18" /></svg>;
}
