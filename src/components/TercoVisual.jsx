import { useEffect, useMemo, useRef, useState } from "react";
import { collection, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import "./TercoVisual.css";
import { db } from "../services/firebase";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function classifyLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return "empty";
  if (/^\d+ª\s+dezena$/i.test(trimmed)) return "decade";
  if (/^(Primeira|Segunda|Terceira|Quarta|Quinta)\s+Dezena$/i.test(trimmed)) return "decade";

  const headings = new Set([
    "Sinal da Cruz",
    "Oferecimento",
    "Creio",
    "Pai Nosso",
    "Ave Maria",
    "Glória",
    "Salve Rainha",
    "Oração",
    "Oração Final",
    "Meditacao",
    "Meditação",
    "Primeiro Mistério",
    "Segundo Mistério",
    "Terceiro Mistério",
    "Quarto Mistério",
    "Quinto Mistério",
    "Ladainha da Humildade",
  ]);

  if (headings.has(trimmed)) return "heading";
  if (/^\d+x\b/.test(trimmed)) return "heading";
  return "text";
}

function getDisplayName(user) {
  const fallback = user?.email?.split("@")[0] ?? "Voce";
  return user?.displayName?.trim() || user?.name?.trim() || fallback;
}

function getFirstName(user) {
  const full = getDisplayName(user);
  return full.split(/\s+/)[0] || full;
}

function getInitials(user) {
  const name = getDisplayName(user);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function TercoVisual({
  terco,
  stepIndex,
  setStepIndex,
  isPrayerMode,
  onStartPrayer,
  onExitPrayer,
  onBackToMenu,
  onReset,
  fontScale,
  setFontScale,
  user,
}) {
  const steps = useMemo(() => {
    const raw = Array.isArray(terco?.steps) ? terco.steps : [];
    return raw.map((s, i) => ({
      label: s?.label ?? s?.titulo ?? `Etapa ${i + 1}`,
      text: s?.text ?? s?.texto ?? String(s ?? ""),
    }));
  }, [terco]);

  const total = steps.length || 1;
  const safeStepIndex = clamp(stepIndex, 0, total - 1);
  const current = steps[safeStepIndex] ?? { label: "", text: "" };

  const usePhysicalRosary = total <= 1;
  const rosaryItems = useMemo(() => {
    if (!usePhysicalRosary) {
      return Array.from({ length: total }, (_, idx) => ({
        kind: "small",
        index: idx,
      }));
    }

    const items = [];
    let idx = 0;
    const pushBead = (kind) => {
      items.push({ kind, index: idx });
      idx += 1;
    };

    items.push({ kind: "cross" });
    items.push({ kind: "link" });
    pushBead("big");
    for (let i = 0; i < 3; i += 1) pushBead("small");
    pushBead("big");
    items.push({ kind: "medal" });
    items.push({ kind: "link" });

    for (let decade = 0; decade < 5; decade += 1) {
      for (let i = 0; i < 10; i += 1) pushBead("small");
      items.push({ kind: "big", index: idx, decade: decade + 1 });
      idx += 1;
    }
    return items;
  }, [total, usePhysicalRosary]);

  const navTotal = rosaryItems.reduce(
    (max, item) => (typeof item.index === "number" ? Math.max(max, item.index + 1) : max),
    0
  );
  const navIndex = clamp(stepIndex, 0, Math.max(0, navTotal - 1));
  

  const [animKey, setAnimKey] = useState(0);
  const lastIndexRef = useRef(stepIndex);
  const railRef = useRef(null);
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    if (lastIndexRef.current !== stepIndex) {
      setAnimKey((k) => k + 1);
      lastIndexRef.current = stepIndex;
    }
  }, [stepIndex]);

  useEffect(() => {
    setStepIndex((i) => clamp(i, 0, navTotal - 1));
  }, [navTotal, setStepIndex]);

  useEffect(() => {
    if (!user?.uid) return;
    const ref = doc(collection(db, "presence", "global", "users"), user.uid);
    setDoc(
      ref,
      {
        uid: user.uid,
        name: getDisplayName(user),
        activeIndex: navIndex,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }, [navIndex, user]);

  useEffect(() => {
    const ref = collection(db, "presence", "global", "users");
    const unsubscribe = onSnapshot(ref, (snap) => {
      const now = Date.now();
      const fresh = snap.docs
        .map((docSnap) => docSnap.data())
        .filter((data) => {
          const ts = data?.updatedAt?.toMillis?.() ?? 0;
          return now - ts < 5 * 60 * 1000;
        });
      setActiveUsers(fresh);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!railRef.current) return;
    const active = railRef.current.querySelector("[data-rosary-active='true']");
    if (!active) return;
    active.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
  }, [navIndex]);

  const progress = navTotal > 1 ? ((navIndex + 1) / navTotal) * 100 : 0;

  const goPrev = () => setStepIndex((i) => clamp(i - 1, 0, navTotal - 1));
  const goNext = () => setStepIndex((i) => clamp(i + 1, 0, navTotal - 1));

  return (
    <div className={`tv ${isPrayerMode ? "tv--prayer" : ""}`}>
      <div className="tv-layout">
        <aside className="tv-rosary" aria-label="Terço lateral">
          <div className="tv-rosary__title">Terço</div>
          <div className="tv-rosary__rail" ref={railRef}>
            <div className="tv-rosary__track">
              {rosaryItems.map((item, idx) => {
                if (item.kind === "medal") {
                  return <div key={`medal-${idx}`} className="rosary-medal" aria-hidden="true" />;
                }
                if (item.kind === "link") {
                  return <div key={`link-${idx}`} className="rosary-link" aria-hidden="true" />;
                }
                if (item.kind === "cross") {
                  return <div key={`cross-${idx}`} className="rosary-cross" aria-hidden="true" />;
                }

              const beadIndex = item.index ?? 0;
              const done = beadIndex < navIndex;
              const active = beadIndex === navIndex;
              const label = usePhysicalRosary ? `Conta ${beadIndex + 1}` : `Etapa ${beadIndex + 1}`;
              const badges = activeUsers.filter((u) => u?.activeIndex === beadIndex);

              return (
                <button
                  key={`bead-${beadIndex}`}
                  className={`rosary-bead rosary-bead--${item.kind} ${item.decade ? "rosary-bead--decade" : ""} ${
                    done ? "rosary-bead--done" : ""
                  } ${active ? "rosary-bead--active" : ""}`}
                  onClick={() => setStepIndex(beadIndex)}
                  data-rosary-active={active ? "true" : "false"}
                  aria-label={`Ir para ${label}`}
                  title={label}
                >
                  {badges.length > 0 && (
                    <span className="rosary-bead__initials" aria-hidden="true">
                      {badges.map((u) => {
                        const isSelf = u?.uid && user?.uid && u.uid === user.uid;
                        const text = isSelf ? getFirstName(user) : getInitials(u);
                        return (
                          <span key={u?.uid ?? text} className={`rosary-bead__badge ${isSelf ? "is-self" : ""}`}>
                            {text}
                          </span>
                        );
                      })}
                    </span>
                  )}
                </button>
              );
            })}
            </div>
          </div>
          <div className="tv-rosary__hint">Toque nas contas enquanto reza.</div>
          <div className="tv-rosary__nav">
            <button className="btn tv-btn" onClick={goPrev} disabled={navIndex <= 0}>
              ← Voltar
            </button>
            <button className="btn btn--primary tv-btn" onClick={goNext} disabled={navIndex >= navTotal - 1}>
              Avançar →
            </button>
          </div>
        </aside>

        <div className="tv-main">
          {/* Top bar (some no modo oração -> vira flutuante) */}
          <div className={`tv-top ${isPrayerMode ? "tv-top--floating" : ""}`}>
            <div className="tv-top__left">
              <button className="btn tv-btn" onClick={onBackToMenu}>
                ← Menu
              </button>

              <div className="tv-titlewrap">
                <div className="tv-title">{terco?.title ?? "Terço"}</div>
                <div className="tv-subtitle">{navTotal > 1 ? `${navIndex + 1} / ${navTotal}` : "oração"}</div>
              </div>
            </div>

            <div className="tv-top__right">
              {!isPrayerMode ? (
                <button className="btn btn--primary tv-btn" onClick={onStartPrayer}>
                  Entrar no foco
                </button>
              ) : (
                <button className="btn tv-btn" onClick={onExitPrayer}>
                  Voltar ao normal
                </button>
              )}

              <button className="btn tv-btn" onClick={onReset} title="Voltar ao início">
                Voltar ao início
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="tv-progress">
            <div className="tv-progress__bar" style={{ width: `${progress}%` }} />
          </div>

          {/* Reader */}
          <div className="reader">
            <div className="reader__head">
              <div className="reader__label">{current.label}</div>

              <div className="reader__tools">
                <button
                  className="btn btn--ghost tv-btn"
                  onClick={() => setFontScale((s) => clamp(+(s - 0.05).toFixed(2), 0.9, 1.25))}
                  title="Diminuir fonte"
                >
                  A-
                </button>
                <button
                  className="btn btn--ghost tv-btn"
                  onClick={() => setFontScale((s) => clamp(+(s + 0.05).toFixed(2), 0.9, 1.25))}
                  title="Aumentar fonte"
                >
                  A+
                </button>
              </div>
            </div>

            <div
              key={animKey}
              className="reader__body reader__body--animate"
              style={{ fontSize: `${16 * fontScale}px` }}
            >
              {String(current.text || "")
                .split("\n")
                .map((line, i) => {
                  const kind = classifyLine(line);
                  if (kind === "empty") return null;
                  const content = line.trim();
                  if (kind === "decade") {
                    return (
                      <p key={i} className="reader__decade">
                        {content}
                      </p>
                    );
                  }
                  if (kind === "heading") {
                    return (
                      <p key={i} className="reader__heading">
                        {content}
                      </p>
                    );
                  }
                  return <p key={i}>{content}</p>;
                })}
            </div>

            {isPrayerMode && (
              <div className="hint">Rezem no mesmo ritmo tocando nas contas.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
