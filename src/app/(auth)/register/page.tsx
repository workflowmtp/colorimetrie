"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    login: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: formData.nom,
          email: formData.email,
          login: formData.login,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de l'inscription");
      } else {
        router.push("/login?message=Inscription réussie. Vous pouvez maintenant vous connecter.");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
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
          MULTIPRINT S.A. — Créer un compte
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="form-label">Nom complet</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            className="form-input"
            placeholder="Votre nom complet"
            autoFocus
            required
          />
        </div>

        <div>
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            placeholder="votre.email@exemple.com"
            required
          />
        </div>

        <div>
          <label className="form-label">Identifiant</label>
          <input
            type="text"
            name="login"
            value={formData.login}
            onChange={handleChange}
            className="form-input"
            placeholder="Choisissez un identifiant"
            required
          />
        </div>

        <div>
          <label className="form-label">Mot de passe</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            placeholder="Choisissez un mot de passe"
            required
            minLength={6}
          />
        </div>

        <div>
          <label className="form-label">Confirmer le mot de passe</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="form-input"
            placeholder="Confirmez votre mot de passe"
            required
            minLength={6}
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
          {loading ? "Inscription..." : "Créer mon compte"}
        </button>

        <div className="text-center pt-3 border-t" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Vous avez déjà un compte ?{" "}
            <a
              href="/login"
              className="text-accent-blue hover:underline font-medium"
            >
              Se connecter
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
