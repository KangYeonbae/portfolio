"use client";
import Link from "next/link";
import { ProjectArchive } from "@/components/project-archive";
import { InteractivePortrait } from "@/components/interactive-portrait";
import type { Project } from "@/data/projects";
import styles from "./experience.module.css";
export function Experience({ projects }: { projects: Project[] }) {
 return <main className={styles.main}><header className={styles.nav}><Link href="/" className={styles.brand}><span>KYB<span className={styles.brandDot}>.</span></span><small>AI PRODUCT ENGINEER</small></Link><nav aria-label="주요 메뉴"><Link href="/explore" prefetch={false}>SELECTED WORK</Link><a href="#archive">ALL PROJECTS</a><a href="#about">ABOUT</a><a href="/Kang-Yeonbae-Portfolio.pdf" target="_blank" rel="noreferrer">PDF</a></nav></header>
 <section className={styles.hero}><div className={styles.heroGrid}><div><p className={styles.eyebrow}><span className={styles.liveDot} /> KANG YEONBAE · PORTFOLIO</p><h1>아이디어를<br /><em>작동하는</em><br />경험으로.</h1><p className={styles.lead}>사용자의 문제에서 시작해, AI와 기술이 실제로 쓰이는 제품이 되기까지. 그 과정을 함께 살펴보세요.</p><div className={styles.heroActions}><Link href="/explore" className={styles.primary}>프로젝트 둘러보기 <span>↗</span></Link><Link href="/projects" className={styles.secondary}>전체 프로젝트</Link></div></div><div className={styles.heroVisual}><InteractivePortrait /></div></div><div className={styles.heroBottom}><span>SCROLL TO EXPLORE ↓</span><span>DESIGNED TO WORK IN THE REAL WORLD</span></div></section>
 <section className={styles.archiveSection} id="archive"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>THE COMPLETE ARCHIVE</p><h2>더 많은 아이디어,<br /><em>더 많은 시도.</em></h2></div><p>실무에서 운영한 시스템부터 직접 만든 제품과 실험까지.<br />관심 있는 작업을 찾아보세요.</p></div><ProjectArchive projects={projects} /></section>
 <footer className={styles.footer} id="about"><p className={styles.eyebrow}>LET’S BUILD SOMETHING MEANINGFUL</p><h2>다음 문제는<br /><em>함께 풀어볼까요?</em></h2><p>AI를 실제 업무와 사용자의 경험에 연결합니다.</p><div className={styles.footerLinks}><a href="mailto:dusqo7951@gmail.com">이메일 보내기 ↗</a><a href="https://github.com/KangYeonbae" target="_blank" rel="noreferrer">GitHub ↗</a><a href="/Kang-Yeonbae-Portfolio.pdf" target="_blank" rel="noreferrer">포트폴리오 PDF ↗</a></div><div className={styles.footerBottom}><span>© KANG YEONBAE</span><span>BUILT WITH INTENTION.</span></div></footer></main>;
}
