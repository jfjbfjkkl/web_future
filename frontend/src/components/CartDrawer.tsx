"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "../store/cart";
import { useState } from "react";
import { useAuthStore } from "../store/auth";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: Props) {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartStore((s) => s.total());
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();

  const goToLogin = () => {
    router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
  };

  const proceed = () => {
    if (!user) {
      goToLogin();
      return;
    }
    // Redirection vers la page de paiement
    const checkoutUrl = `${window.location.origin}/checkout?redirect=${encodeURIComponent(pathname)}`;
    window.location.href = checkoutUrl;
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black"
            onClick={onClose}
            aria-hidden
          />

          <motion.aside
            key="drawer"
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 z-40 flex h-full w-[340px] flex-col border-l border-white/10 bg-[#0c1220]/95 p-6 text-white shadow-2xl backdrop-blur"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex flex-col gap-2">
                {!user && (
                  <button
                    onClick={goToLogin}
                    className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:border-white/20 hover:bg-white/10"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[11px] text-white/80 transition group-hover:bg-white/20">👤</span>
                    Connexion
                  </button>
                )}
                <div>
                  <h2 className="text-lg font-semibold">Panier</h2>
                  <p className="text-xs text-white/60">{items.length} article(s)</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15"
                aria-label="Fermer le panier"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {items.length === 0 && (
                <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/70">
                  Votre panier est vide.
                </div>
              )}

              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">{item.title}</span>
                    <span className="text-xs text-white/60">{item.quantity} × {item.price.toLocaleString("fr-FR") } FCFA</span>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-white transition hover:bg-white/20"
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Total</span>
                <span className="text-base font-semibold">{total.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <button
                onClick={proceed}
                className="w-full rounded-lg bg-gradient-to-b from-[#6fa4ff] to-[#375892] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(63,122,255,0.35)] transition hover:translate-y-[-1px] hover:shadow-[0_14px_30px_rgba(63,122,255,0.45)]"
              >
                Procéder au paiement
              </button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
