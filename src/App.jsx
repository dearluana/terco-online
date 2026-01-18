import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./App.css";

import AuthScreen from "./components/AuthScreen";
import MenuTercos from "./components/MenuTercos";
import TercoVisual from "./components/TercoVisual";
import { auth } from "./services/firebase";

/**
 * 🔧 AJUSTE AQUI conforme seu textos.js
 * Deixe apenas UMA dessas opções funcionando:
 */

// OPÇÃO A: export const TERCOS = [...]
import { textos as DATA_TERCOS } from "./data/textos";

// OPÇÃO B: export default [...]
/*
import DATA_TERCOS from "./textos";
*/

// OPÇÃO C: export const textos = {...}
/*
import { textos as DATA_TERCOS } from "./textos";
*/

const LS_KEY = "terco_online_v1";

function safeLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeSave(payload) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export default function App() {
  const tercos = useMemo(() => {
    if (!DATA_TERCOS || typeof DATA_TERCOS !== "object") return [];

    return Object.entries(DATA_TERCOS).map(([key, value]) => ({
      id: key,
      title: value.titulo,
      subtitle: "Comece sua oração com calma e atenção",
      steps: [
        {
          label: value.titulo,
          text: value.texto,
        },
      ],
    }));
  }, [DATA_TERCOS]);

  const [selectedId, setSelectedId] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPrayerMode, setIsPrayerMode] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // carregar progresso
  useEffect(() => {
    const saved = safeLoad();
    if (!saved) return;

    if (saved.selectedId) setSelectedId(saved.selectedId);
    if (typeof saved.stepIndex === "number") setStepIndex(saved.stepIndex);
    if (typeof saved.fontScale === "number") setFontScale(saved.fontScale);
    if (saved.theme === "dark" || saved.theme === "light") setTheme(saved.theme);
  }, []);

  // salvar progresso
  useEffect(() => {
    safeSave({ selectedId, stepIndex, fontScale, theme });
  }, [selectedId, stepIndex, fontScale, theme]);

  useEffect(() => {
    document.body.classList.toggle("theme-dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const selectedTerco = useMemo(() => {
    if (!selectedId) return null;
    return tercos.find((t) => (t.id ?? t.title) === selectedId) ?? null;
  }, [selectedId, tercos]);

  const handleSelectTerco = (terco) => {
    const id = terco.id ?? terco.title;
    setSelectedId(id);
    setStepIndex(0);
    setIsPrayerMode(false);
  };

  const handleStartPrayer = () => {
    if (!selectedTerco) return;
    setIsPrayerMode(true);
  };

  const handleExitPrayer = () => {
    setIsPrayerMode(false);
  };

  const handleReset = () => {
    setStepIndex(0);
    setIsPrayerMode(false);
  };

  if (!authReady) {
    return (
      <div className="app-root">
        <div className="bg-orb bg-orb--a" />
        <div className="bg-orb bg-orb--b" />
        <main className="app-shell app-shell--auth">
          <div className="glass auth-loading">Carregando...</div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-root">
        <div className="bg-orb bg-orb--a" />
        <div className="bg-orb bg-orb--b" />

        <main className="app-shell app-shell--auth">
          <div className="glass">
            <AuthScreen />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-root">
      {/* Background decor */}
      <div className="bg-orb bg-orb--a" />
      <div className="bg-orb bg-orb--b" />

      {/* Header some no modo oração */}
      {!isPrayerMode && (
        <header className="app-header">
          <div className="app-header__inner">
            <div className="brand">
              <div className="brand__dot" />
              <div className="brand__text">
                <div className="brand__title">Terço Online</div>
                <div className="brand__subtitle">companheiro para a oração cotidiana</div>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="btn btn--ghost"
                onClick={() => signOut(auth)}
                title="Sair"
              >
                Sair
              </button>
              <button
                className="btn btn--ghost"
                onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                title="Alternar tema"
              >
                {theme === "dark" ? "Tema claro" : "Tema escuro"}
              </button>
            </div>
          </div>
        </header>
      )}

      <main className={`app-shell ${isPrayerMode ? "app-shell--prayer" : ""}`}>
        <div className="glass">
          {!selectedTerco ? (
            <MenuTercos tercos={tercos} onSelect={handleSelectTerco} />
          ) : (
            <TercoVisual
              terco={selectedTerco}
              stepIndex={stepIndex}
              setStepIndex={setStepIndex}
              isPrayerMode={isPrayerMode}
              onStartPrayer={handleStartPrayer}
              onExitPrayer={handleExitPrayer}
              onBackToMenu={() => setSelectedId(null)}
              onReset={handleReset}
              fontScale={fontScale}
              setFontScale={setFontScale}
              user={user}
            />
          )}
        </div>

        <footer className="app-footer">
          <span className="muted">Consagre um tempo à oração e fortaleça sua fé</span>
        </footer>
      </main>
    </div>
  );
}
