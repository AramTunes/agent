import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import "@/lib/keys";
import { readToken, writeToken } from "@/lib/api";
import { RoundAvatar } from "@/lib/page-avatar";

export type AppUser = {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
  profileImageUrl: string | null;
  isDevFallback: boolean;
};

type State = { user: AppUser | null; isPending: boolean };

const SessionContext = createContext<State>({ user: null, isPending: true });
const USER_KEY = "agent.user";

function readCachedUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as AppUser;
    if (!user || typeof user.id !== "string") return null;
    return user;
  } catch {
    return null;
  }
}

function writeCachedUser(user: AppUser | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ user: null, isPending: true });
  useEffect(() => {
    let live = true;
    const token = readToken();
    const cached = token ? readCachedUser() : null;
    if (!token) {
      writeCachedUser(null);
      setState({ user: null, isPending: false });
      return;
    }
    if (cached) setState({ user: cached, isPending: false });
    fetch("/api/v1/session", { headers: { authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((json) => {
        if (!live) return;
        const user = json?.ok ? (json.data?.user ?? null) : null;
        if (!user) writeToken(null);
        writeCachedUser(user);
        setState({ user, isPending: false });
      })
      .catch(() => {
        if (live) setState({ user: cached, isPending: false });
      });
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    const refresh = () => {
      const token = readToken();
      if (!token) return;
      fetch("/api/v1/session", { headers: { authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((json) => {
          const user = json?.ok ? (json.data?.user ?? null) : null;
          if (user) {
            writeCachedUser(user);
            setState({ user, isPending: false });
          }
        })
        .catch(() => undefined);
    };
    window.addEventListener("agent-avatar", refresh);
    return () => window.removeEventListener("agent-avatar", refresh);
  }, []);
  const value = useMemo(() => state, [state]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useCurrentUserState(): State {
  return useContext(SessionContext);
}

export function useCurrentUser(): AppUser | null {
  return useCurrentUserState().user;
}

export async function adoptSession(token: string) {
  writeToken(token);
}

export async function signOut() {
  const token = readToken();
  writeToken(null);
  writeCachedUser(null);
  try {
    await fetch("/api/v1/auth/signout", {
      method: "POST",
      headers: token ? { authorization: `Bearer ${token}` } : {},
    });
  } catch {
    /* local sign-out still stands */
  }
  window.location.assign("/");
}

export function AccountChip() {
  const user = useCurrentUser();
  const [pending, setPending] = useState(false);
  if (!user) return null;
  const label = user.displayName ?? user.primaryEmail ?? "حساب";
  return (
    <div className="flex items-center gap-2">
      {user.profileImageUrl ? <RoundAvatar value={user.profileImageUrl} size={32} /> : <RoundAvatar value={`beam:${label}`} size={32} />}
      <span className="hidden max-w-28 truncate text-sm font-medium sm:inline">{label}</span>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setPending(true);
          void signOut();
        }}
        className="text-sm text-muted"
      >
        {pending ? "…" : "خروج"}
      </button>
    </div>
  );
}
