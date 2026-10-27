import { createContext, useContext, useState, type ReactNode } from "react";
import { api, type User } from "../api/client";

interface AuthCtx {
  user: User | null;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("dcas_user");
    return raw ? (JSON.parse(raw) as User) : null;
  });

  async function loginWithGoogle(credential: string) {
    const res = await api.googleLogin(credential);
    localStorage.setItem("dcas_token", res.access_token);
    localStorage.setItem("dcas_user", JSON.stringify(res.user));
    setUser(res.user);
  }

  function logout() {
    localStorage.removeItem("dcas_token");
    localStorage.removeItem("dcas_user");
    setUser(null);
  }

  return <Ctx.Provider value={{ user, loginWithGoogle, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
