"use client";

import { create } from "zustand";
import { apiPost, apiGet } from "../lib/api";

export type User = {
  id: number;
  name: string;
  email: string;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  async login(email, password) {
    set({ loading: true, error: null });
    try {
      const res = await apiPost<{ success: boolean; user: User; message?: string }>("/auth/login", { email, password });
      if (res.success && res.user) {
        set({ user: res.user, error: null });
      } else {
        throw new Error(res.message || "Erreur de connexion");
      }
    } catch (e: any) {
      const errorMsg = e.message ?? "Erreur de connexion";
      set({ error: errorMsg });
      console.error("Erreur de connexion:", errorMsg);
      throw new Error(errorMsg);
    } finally {
      set({ loading: false });
    }
  },
  async register(name, email, password, password_confirmation) {
    set({ loading: true, error: null });
    try {
      console.log("Envoi des données d'inscription:", { name, email, password: "***" });
      const res = await apiPost<{ success: boolean; user: User; message?: string }>("/auth/register", {
        name,
        email,
        password,
        password_confirmation,
      });
      if (res.success && res.user) {
        set({ user: res.user, error: null });
        console.log("✅ Inscription réussie:", res.message);
      } else {
        throw new Error(res.message || "Erreur d'inscription");
      }
    } catch (e: any) {
      const errorMsg = e.message ?? "Erreur d'inscription";
      set({ error: errorMsg });
      console.error("❌ Erreur d'inscription:", errorMsg);
      throw new Error(errorMsg);
    } finally {
      set({ loading: false });
    }
  },
  async logout() {
    set({ loading: true, error: null });
    try {
      await apiPost("/auth/logout", {});
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },
  async fetchUser() {
    set({ loading: true, error: null });
    try {
      const res = await apiGet<{ success: boolean; user: User }>("/auth/me");
      if (res.success && res.user) {
        set({ user: res.user });
      } else {
        set({ user: null });
      }
    } catch (e) {
      set({ user: null });
      console.log("Utilisateur non authentifié");
    } finally {
      set({ loading: false });
    }
  },
}));
