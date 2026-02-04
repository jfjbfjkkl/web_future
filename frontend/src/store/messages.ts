"use client";

import { create } from "zustand";
import { apiPost, apiGet, apiDelete } from "../lib/api";

export type UserMessage = {
  id: number;
  type: "notification" | "code" | "order";
  title: string;
  content: string;
  code?: string;
  read_status: boolean;
  created_at: string;
};

type MessageState = {
  messages: UserMessage[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchMessages: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAsUnread: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteMessage: (id: number) => Promise<void>;
};

export const useMessageStore = create<MessageState>((set) => ({
  messages: [],
  unreadCount: 0,
  loading: false,
  error: null,

  async fetchMessages() {
    set({ loading: true, error: null });
    try {
      const res = await apiGet<{ success: boolean; data: { data: UserMessage[] } }>("/messages");
      if (res.success && res.data?.data) {
        set({ messages: res.data.data });
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : "Erreur de chargement des messages";
      set({ error: errorMsg });
    } finally {
      set({ loading: false });
    }
  },

  async fetchUnreadCount() {
    try {
      const res = await apiGet<{ success: boolean; unread_count: number }>("/messages/unread-count");
      if (res.success) {
        set({ unreadCount: res.unread_count });
      }
    } catch (e) {
      // Erreur silencieuse
    }
  },

  async markAsRead(id: number) {
    try {
      await apiPost(`/messages/${id}/read`, {});
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === id ? { ...msg, read_status: true } : msg
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : "Erreur";
      set({ error: errorMsg });
    }
  },

  async markAsUnread(id: number) {
    try {
      await apiPost(`/messages/${id}/unread`, {});
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === id ? { ...msg, read_status: false } : msg
        ),
        unreadCount: state.unreadCount + 1,
      }));
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : "Erreur";
      set({ error: errorMsg });
    }
  },

  async markAllAsRead() {
    try {
      await apiPost("/messages/mark-all-read", {});
      set((state) => ({
        messages: state.messages.map((msg) => ({ ...msg, read_status: true })),
        unreadCount: 0,
      }));
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : "Erreur";
      set({ error: errorMsg });
    }
  },

  async deleteMessage(id: number) {
    try {
      await apiDelete(`/messages/${id}`);
      set((state) => {
        const message = state.messages.find((msg) => msg.id === id);
        return {
          messages: state.messages.filter((msg) => msg.id !== id),
          unreadCount: message && !message.read_status ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : "Erreur";
      set({ error: errorMsg });
    }
  },
}));
