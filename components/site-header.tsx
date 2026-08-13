"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Close, Menu } from "./icons";

const links = [
  { href: "/", label: "Home" },
  { href: "/#work", label: "Selected work" },
  { href: "/projects", label: "Projects" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/notes", label: "Notes" },
  { href: "/#about", label: "About" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const active = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/projects")) return pathname.startsWith("/projects");
    if (href.startsWith("/portfolio")) return pathname.startsWith("/portfolio");
    if (href.startsWith("/notes")) return pathname.startsWith("/notes");
    return false;
  };

  return (
    <>
      <aside className="site-sidebar">
        <Link href="/" className="sidebar-brand" aria-label="강연배 홈">
          <span className="brand-mark">KYB</span>
          <span><strong>Kang YeonBae</strong><small>AI Product Engineer</small></span>
        </Link>

        <nav className="sidebar-nav" aria-label="주요 메뉴">
          <p>NAVIGATION</p>
          {links.map((link) => (
            <Link className={active(link.href) ? "active" : ""} key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-meta">
          <div><span className="availability-dot" /><p><strong>Available for</strong><br />interesting problems</p></div>
          <a href="mailto:dusqo7951@gmail.com">Let&apos;s talk <ArrowUpRight /></a>
          <Link href="/studio">Open Studio</Link>
        </div>
      </aside>

      <header className="mobile-header">
        <Link href="/" className="brand" aria-label="강연배 홈"><span className="brand-mark">KYB</span><span className="brand-copy">Kang YeonBae</span></Link>
        <button type="button" className="menu-button" aria-expanded={open} aria-label={open ? "메뉴 닫기" : "메뉴 열기"} onClick={() => setOpen((value) => !value)}>{open ? <Close /> : <Menu />}</button>
        {open && <nav className="mobile-nav" aria-label="모바일 메뉴">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}<a href="mailto:dusqo7951@gmail.com">Let&apos;s talk ↗</a></nav>}
      </header>
    </>
  );
}
