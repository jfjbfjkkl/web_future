"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "../../store/auth";

export default function LoginClient() {
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get("redirect") || "/";
  const { login, loading, error } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccess(null);

    try {
      await login(email, password);
      setSuccess("Connexion réussie! Redirection...");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => router.push(redirect), 500);
    } catch (err: any) {
      const errorMsg = err?.message ?? "Erreur de connexion";
      setLocalError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-[#050912] text-white">
      <div className="noise-overlay" aria-hidden />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.06),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(123,151,210,0.18),transparent_32%),radial-gradient(circle_at_60%_70%,rgba(40,71,117,0.28),transparent_40%)]"
        aria-hidden
      />

      <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12 sm:px-8">
        <div className="glass-panel rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-semibold">Connexion</h1>
          <p className="mt-2 text-sm text-white/70">Accédez à vos commandes et poursuivez le paiement.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4 text-sm">
            <div className="space-y-2">
              <label className="text-white/80">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-white placeholder:text-white/50"
                placeholder="vous@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-white/80">Mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-white placeholder:text-white/50"
                placeholder="••••••••"
              />
            </div>

            {success && (
              <p className="rounded-lg bg-green-500/20 border border-green-500/40 px-3 py-2 text-xs text-green-300">{success}</p>
            )}

            {(error || localError) && (
              <p className="rounded-lg bg-red-500/20 border border-red-500/40 px-3 py-2 text-xs text-red-300">{localError ?? error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-b from-[#6fa4ff] to-[#375892] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(63,122,255,0.35)] transition hover:translate-y-[-1px] hover:shadow-[0_14px_30px_rgba(63,122,255,0.45)] disabled:opacity-60"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-xs text-white/70">
            <span>Pas de compte ?</span>
            <button
              onClick={() => router.push(`/register?redirect=${encodeURIComponent(redirect)}`)}
              className="rounded-full border border-white/10 px-3 py-2 text-white transition hover:border-white/20 hover:bg-white/10"
            >
              Créer un compte
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
