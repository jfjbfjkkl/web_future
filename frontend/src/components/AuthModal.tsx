"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/auth";

type Props = {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
};

export function AuthModal({ open, onClose, onAuthenticated }: Props) {
  const { login, register, loading, error } = useAuthStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = async () => {
    setLocalError(null);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password, form.password_confirmation);
      }
      onAuthenticated();
      onClose();
    } catch (e: any) {
      setLocalError(e?.message ?? "Erreur");
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="auth-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black"
            onClick={onClose}
          />
          <motion.div
            key="auth-modal"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 z-50 w-[420px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#0c1220]/95 p-6 shadow-2xl backdrop-blur"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {mode === "login" ? "Connexion" : "Inscription"}
              </h3>
              <div className="flex gap-2 text-xs text-white/60">
                <button
                  className={`rounded-full px-3 py-1 ${mode === "login" ? "bg-white/10 text-white" : "bg-white/5"}`}
                  onClick={() => setMode("login")}
                >
                  Connexion
                </button>
                <button
                  className={`rounded-full px-3 py-1 ${mode === "register" ? "bg-white/10 text-white" : "bg-white/5"}`}
                  onClick={() => setMode("register")}
                >
                  Inscription
                </button>
              </div>
            </div>

            <div className="space-y-3 text-sm text-white">
              {mode === "register" && (
                <input
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/50"
                  placeholder="Nom"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              )}
              <input
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/50"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/50"
                placeholder="Mot de passe"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {mode === "register" && (
                <input
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/50"
                  placeholder="Confirmer le mot de passe"
                  type="password"
                  value={form.password_confirmation}
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                />
              )}
            </div>

            {(error || localError) && (
              <p className="mt-3 text-xs text-red-300">{localError ?? error}</p>
            )}

            <button
              onClick={submit}
              disabled={loading}
              className="mt-5 w-full rounded-lg bg-gradient-to-b from-[#6fa4ff] to-[#375892] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(63,122,255,0.35)] transition hover:translate-y-[-1px] hover:shadow-[0_14px_30px_rgba(63,122,255,0.45)] disabled:opacity-60"
            >
              {loading ? "Veuillez patienter..." : mode === "login" ? "Se connecter" : "Créer un compte"}
            </button>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
