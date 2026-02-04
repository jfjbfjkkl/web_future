import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useMessageStore } from "../store/messages";
import { useAuthStore } from "../store/auth";
import { MessagingPanel } from "./MessagingPanel";

export function NotificationIcon() {
  const { unreadCount, fetchUnreadCount, fetchMessages } = useMessageStore();
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    
    fetchUnreadCount();
    fetchMessages();
    
    // Rafraîchir les messages toutes les 30 secondes
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount, fetchMessages, user]);

  if (!mounted) return null;

  // Si l'utilisateur n'est pas connecté, afficher une icône grisée
  if (!user) {
    return (
      <motion.button
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/40 transition opacity-50 cursor-not-allowed"
        aria-label="Messages (connectez-vous)"
        disabled
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </motion.button>
    );
  }

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        aria-label="Messages et notifications"
      >
        {/* Icône cloche */}
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Badge de compteur */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-[#ff9b3f] to-[#ff5f42] text-xs font-bold text-white"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Panneau de messagerie */}
      <MessagingPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
