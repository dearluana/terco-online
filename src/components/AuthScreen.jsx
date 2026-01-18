import { useMemo, useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "../services/firebase";

const ERROR_MAP = {
  "auth/invalid-email": "Informe um e-mail valido.",
  "auth/user-disabled": "Esta conta esta desativada.",
  "auth/user-not-found": "Conta nao encontrada.",
  "auth/wrong-password": "Senha incorreta.",
  "auth/email-already-in-use": "Este e-mail ja esta em uso.",
  "auth/weak-password": "Escolha uma senha com pelo menos 6 caracteres.",
};

export default function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";
  const title = isLogin ? "Bem-vindo de volta" : "Crie sua conta";
  const cta = isLogin ? "Entrar" : "Cadastrar";
  const helper = isLogin
    ? "Ainda nao tem conta? Cadastre-se."
    : "Ja tem conta? Acesse.";

  const canSubmit = useMemo(() => {
    if (!email.trim() || !password) return false;
    return !loading;
  }, [email, password, loading]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err) {
      const message = ERROR_MAP[err?.code] ?? "Nao foi possivel autenticar. Tente novamente.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <div className="auth-head">
          <span className="auth-kicker">Terco Online</span>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">
            Entre para salvar seu progresso e continuar a oracao onde parou.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="auth-field">
            <span>Senha</span>
            <input
              type="password"
              placeholder="Minimo 6 caracteres"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
            />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button className="btn btn--primary auth-submit" type="submit" disabled={!canSubmit}>
            {loading ? "Aguarde..." : cta}
          </button>
        </form>

        <button
          className="auth-toggle"
          type="button"
          onClick={() => setMode(isLogin ? "register" : "login")}
        >
          {helper}
        </button>
      </div>
    </section>
  );
}
