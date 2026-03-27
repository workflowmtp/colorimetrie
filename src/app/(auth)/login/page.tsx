"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou mot de passe incorrect");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-blue/20 mb-4">
          <span className="text-3xl">🎨</span>
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          ColorLab Pro
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          MULTIPRINT S.A. — Gestion colorimetrique
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="form-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            placeholder="Votre email"
            autoFocus
            required
          />
        </div>

        <div>
          <label className="form-label">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            placeholder="Votre mot de passe"
            required
          />
        </div>

        {error && (
          <div className="px-3 py-2 rounded-lg text-sm font-medium text-accent-red" style={{ background: "var(--bg-elevated)" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full py-2.5"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <div className="text-center pt-3 border-t" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Pas encore de compte ?{" "}
            <a
              href="/register"
              className="text-accent-blue hover:underline font-medium"
            >
              Créer un compte
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
