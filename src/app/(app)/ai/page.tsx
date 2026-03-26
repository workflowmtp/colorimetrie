"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function AIPage() {
  const { can } = useAuth();
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      if (res.ok) {
        setResponse(data.response);
      } else {
        setResponse("❌ Erreur: " + (data.error || "Problème lors de la requête"));
      }
    } catch (error) {
      setResponse("❌ Erreur de connexion au serveur IA");
    } finally {
      setLoading(false);
    }
  }

  if (!can("ai.use")) {
    return (
      <div className="card p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Accès refusé</h2>
        <p style={{ color: "var(--text-muted)" }}>Vous n'avez pas la permission d'utiliser l'agent IA.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: "var(--accent-blue/20)" }}>
          <span className="text-3xl">🤖</span>
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Agent IA ColorLab</h1>
        <p className="max-w-2xl mx-auto" style={{ color: "var(--text-muted)" }}>
          Votre assistant expert en colorimétrie industrielle. Posez vos questions sur les formulations, 
          mesures spectro, processus d'impression et contrôles qualité.
        </p>
      </div>

      {/* Chat Container */}
      <div className="card overflow-hidden">
        {/* Chat Header */}
        <div className="border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}>
          <div className="flex items-center space-x-3 p-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--accent-blue)" }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>ColorLab IA</h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Assistant colorimétrie</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="h-96 overflow-y-auto p-6 space-y-4" style={{ backgroundColor: "var(--bg-main)" }}>
          {response && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--accent-blue/20)" }}>
                <span className="text-sm">🤖</span>
              </div>
              <div className="flex-1">
                <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>
                    {response}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--accent-blue/20)" }}>
                <span className="text-sm">🤖</span>
              </div>
              <div className="flex-1">
                <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--accent-blue)" }}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--accent-blue)", animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--accent-blue)", animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-3">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg resize-none form-input"
                rows={3}
                placeholder="Ex: Quelle formulation recommandez-vous pour le bleu Pantone 294 sur papier couché ?"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="btn btn-primary px-6 py-3 h-fit flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Envoi...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Envoyer</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: "var(--accent-blue/10)" }}>
        <h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>💡 Suggestions de questions :</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
          <div>• Comment corriger un Delta-E trop élevé ?</div>
          <div>• Quelle densité pour le noir sur papier couché ?</div>
          <div>• Formulation offset pour le rouge 032 ?</div>
          <div>• Interpréter une courbe spectrale ?</div>
        </div>
      </div>
    </div>
  );
}
