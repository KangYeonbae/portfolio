"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./experience.module.css";

const contacts = [
  { id: "yuna", name: "유나", tone: "peach", time: "방금", message: "오늘 사진 나한테도 보내줘!" },
  { id: "seoyun", name: "서윤", tone: "mint", time: "오후 3:12", message: "내일도 같이 가자 ☀" },
  { id: "minji", name: "민지", tone: "lavender", time: "오후 2:46", message: "스티커 너무 귀엽다 ㅋㅋ" },
] as const;

export function DubbyRoom() {
  const [sceneReady, setSceneReady] = useState(false);
  const [showApp, setShowApp] = useState(false);
  const [screen, setScreen] = useState<"chat" | "friends">("friends");
  const [contact, setContact] = useState<(typeof contacts)[number] | null>(null);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Partial<Record<(typeof contacts)[number]["id"], string[]>>>({});
  const conversation = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversation.current) conversation.current.scrollTop = conversation.current.scrollHeight;
  }, [contact, messages]);

  useEffect(() => {
    if (!sceneReady) return;
    const timer = window.setTimeout(() => setShowApp(true), 1000);
    return () => window.clearTimeout(timer);
  }, [sceneReady]);

  return (
    <div className={styles.dubbyRoom} data-app={showApp}>
      <div className={styles.dubbyScene} aria-hidden={showApp}>
        <Image
          className={styles.dubbyIllustration}
          src="/project-media/dubby-lounge.webp"
          alt="햇살이 드는 라운지에서 웃으며 휴대폰을 보는 학생 친구들"
          fill
          sizes="100vw"
          loading="eager"
          onLoad={() => setSceneReady(true)}
          onError={() => setShowApp(true)}
        />
      </div>
      <header className={styles.dubbyToolbar}>
        <form method="dialog"><button type="submit" autoFocus>← 전시관으로 돌아가기</button></form>
      </header>
      <div className={styles.dubbyRoomContent}>
        <div className={styles.dubbyRoomCopy}>
          <h1 id="project-preview-title">Dubby</h1>
          {showApp && (
            <>
              <p>친구와 톡하고, 스티커로 마음을 전하는 소셜 메신저.</p>
              <Link className={styles.dubbyDetail} href="/projects/dubby">프로젝트 자세히 보기 ↗</Link>
            </>
          )}
        </div>
        {showApp && (
          <div className={styles.dubbyDevices}>
            <div className={styles.dubbyMascot} aria-hidden="true">
              <i className={styles.dubbyArm} />
              <i className={styles.dubbyWave}><span /></i>
              <i className={styles.dubbyLegs} />
              <Image src="/project-media/dubby-icon.webp" alt="" width={144} height={144} />
            </div>
            <section className={styles.dubbyPhone} aria-label="Dubby 앱 미리보기">
              <span className={styles.dubbyPhoneCamera} aria-hidden="true" />
              <div className={styles.dubbyPhoneScreen}>
                <div className={styles.dubbyPhoneStatus} aria-hidden="true"><span>9:41</span><span>▮▮▮ ▰</span></div>
                {contact ? (
                  <>
                    <header className={styles.dubbyPhoneHeader}>
                      <button type="button" onClick={() => setContact(null)} aria-label="목록으로 돌아가기">‹</button>
                      <h2>{contact.name}</h2>
                    </header>
                    <div ref={conversation} className={styles.dubbyConversation} role="log" aria-label={`${contact.name}와의 예시 대화`}>
                      <small>오늘</small>
                      <p>{contact.message}</p>
                      {messages[contact.id]?.map((message, index) => <p key={index} data-outgoing="true">{message}</p>)}
                    </div>
                    <form className={styles.dubbyComposer} onSubmit={(event) => {
                      event.preventDefault();
                      const message = draft.trim();
                      if (!message) return;
                      setMessages((previous) => ({ ...previous, [contact.id]: [...(previous[contact.id] ?? []), message] }));
                      setDraft("");
                    }}>
                      <input aria-label="예시 메시지" placeholder="메시지 입력" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={180} />
                      <button type="submit" disabled={!draft.trim()}>전송</button>
                    </form>
                  </>
                ) : (
                  <>
                    <header className={styles.dubbyPhoneHeader}><h2>{screen === "friends" ? "친구" : "채팅"}</h2></header>
                    <ul className={styles.dubbyContactList}>
                      {contacts.map((person) => (
                        <li key={person.id}>
                          <button type="button" onClick={() => { setDraft(""); setContact(person); }}>
                            <span className={styles.dubbyContactAvatar} data-tone={person.tone} aria-hidden="true">{person.name[0]}</span>
                            <span className={styles.dubbyContactCopy}>
                              <strong>{person.name}</strong>
                              {screen === "chat" && <small>{messages[person.id]?.at(-1) ?? person.message}</small>}
                            </span>
                            <span className={styles.dubbyContactAction}>{screen === "chat" ? person.time : "톡하기"}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <nav className={styles.dubbyScreenChoices} aria-label="Dubby 화면 선택">
                      <button type="button" aria-pressed={screen === "friends"} onClick={() => setScreen("friends")}>친구</button>
                      <button type="button" aria-pressed={screen === "chat"} onClick={() => setScreen("chat")}>채팅</button>
                    </nav>
                  </>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
