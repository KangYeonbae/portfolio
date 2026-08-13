"use client";

import Link from "next/link";

/** Screen-only controls for the A4 portfolio document. Hidden in the print output. */
export function PrintToolbar({ className, pdfHref }: { className: string; pdfHref: string }) {
  return (
    <div className={className}>
      <Link href="/">← 사이트로 돌아가기</Link>
      <div>
        <a href={pdfHref} download>PDF 다운로드 ↓</a>
        <button type="button" onClick={() => window.print()}>인쇄 · PDF로 저장</button>
      </div>
    </div>
  );
}
