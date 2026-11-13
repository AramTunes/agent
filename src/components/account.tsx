import { createContext, useContext, useEffect, useState } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/session";
import { meFn, updateBusinessFn } from "@/lib/api";
import { fitAvatar, readPageAvatar } from "@/lib/page-avatar";
import { Shell } from "./shell";
import { Skeleton } from "./ui";

export type Membership = {
  businessId: string;
  role: string;
  name: string;
  slug: string;
  status: string;
  avatar?: string;
  categoryId?: string;
  staffId?: string;
};

export type Me = {
  profile: {
    displayName: string;
    phone: string;
    email: string;
    username: string;
    pageFor: string;
    pageName: string;
    activityName: string;
    avatar: string;
    hasPassword?: boolean;
  };
  isAdmin: boolean;
  canClaim: boolean;
  unread: number;
  memberships: Membership[];
};

export function useAccount() {
  const { user, isPending } = useCurrentUserState();
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    if (isPending) return;
    if (!user) {
      setLoading(false);
      return;
    }
    let live = true;
    meFn().then((res) => {
      if (!live) return;
      if (res.ok) setMe(res.data);
      else setError(res.error);
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }, [user?.id, isPending, nonce]);
  useEffect(() => {
    if (!me) return;
    let cancel = false;
    void (async () => {
      let changed = false;
      for (const item of me.memberships) {
        const local = readPageAvatar(item.businessId, item.slug);
        if (!local.startsWith("data:") || item.avatar) continue;
        const avatar = await fitAvatar(local);
        if (cancel || !avatar) continue;
        const res = await updateBusinessFn({ data: { businessId: item.businessId, avatar } });
        if (res.ok) changed = true;
      }
      if (!cancel && changed) {
        window.dispatchEvent(new Event("agent-avatar"));
        window.dispatchEvent(new Event("agent-account"));
      }
    })();
    return () => {
      cancel = true;
    };
  }, [me]);
  useEffect(() => {
    const onReload = () => {
      setLoading(true);
      setNonce((n) => n + 1);
    };
    window.addEventListener("agent-account", onReload);
    return () => window.removeEventListener("agent-account", onReload);
  }, []);
  return {
    user,
    isPending,
    me,
    error,
    loading,
    reload: () => {
      setLoading(true);
      setNonce((n) => n + 1);
    },
  };
}

export function useBusinessId(memberships: Membership[] | undefined) {
  const [businessId, setBusinessId] = useState("");
  useEffect(() => {
    if (!memberships?.length) {
      setBusinessId("");
      return;
    }
    const saved = typeof window !== "undefined" ? localStorage.getItem("agent.business") ?? "" : "";
    const next = memberships.some((item) => item.businessId === saved) ? saved : memberships[0].businessId;
    setBusinessId(next);
  }, [memberships]);
  useEffect(() => {
    function sync() {
      if (!memberships?.length) return;
      const saved = localStorage.getItem("agent.business") ?? "";
      if (memberships.some((item) => item.businessId === saved)) setBusinessId(saved);
    }
    window.addEventListener("agent-business", sync);
    return () => window.removeEventListener("agent-business", sync);
  }, [memberships]);
  function choose(next: string) {
    localStorage.setItem("agent.business", next);
    setBusinessId(next);
    window.dispatchEvent(new Event("agent-business"));
  }
  return { businessId, choose };
}

export const PanelState = createContext<{
  businessId: string;
  memberships: Membership[];
  displayName: string;
  pageFor: string;
  pageName: string;
  role: string;
  staffId: string;
}>({
  businessId: "",
  memberships: [],
  displayName: "",
  pageFor: "",
  pageName: "",
  role: "",
  staffId: "",
});

export function usePanel() {
  return useContext(PanelState);
}

export function AuthWall({ children }: { children: React.ReactNode }) {
  const account = useAccount();
  if (account.isPending || (account.user && account.loading && !account.me)) {
    return (
      <Shell>
        <Skeleton className="h-40" />
      </Shell>
    );
  }
  if (!account.user) return <RedirectToSignIn />;
  return children;
}
