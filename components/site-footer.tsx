import Link from "next/link";
import { ArrowUpRight, Github, Linkedin, Mail } from "./icons";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <p className="footer-kicker">Have a problem worth shipping?</p>
          <h2>아이디어를 운영되는<br />제품으로 바꿔봅시다.</h2>
        </div>
        <div className="footer-links">
          <a href="mailto:dusqo7951@gmail.com"><Mail /> Email <ArrowUpRight /></a>
          <a href="https://github.com/KangYeonbae" target="_blank" rel="noreferrer"><Github /> GitHub <ArrowUpRight /></a>
          <a href="https://linkedin.com/in/yeonbae-kang-973436334" target="_blank" rel="noreferrer"><Linkedin /> LinkedIn <ArrowUpRight /></a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <p>© {new Date().getFullYear()} Kang YeonBae. Built as a living archive.</p>
        <Link href="/studio">Studio</Link>
      </div>
    </footer>
  );
}
