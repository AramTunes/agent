import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PanelState, useAccount, useBusinessId } from "@/components/account";
import { DashboardHeader } from "@/components/dashboard-header";
import { Shell } from "@/components/shell";
import { Skeleton } from "@/components/ui";
import { RedirectToSignIn } from "@/lib/auth/gates";

export const Route = createFileRoute("/panel")({ component: PanelLayout });

function PanelLayout() {
  const account = useAccount();
  const { businessId, choose } = useBusinessId(account.me?.memberships);
  const header = (
    <DashboardHeader
      memberships={account.me?.memberships ?? []}
      businessId={businessId}
      onChoose={choose}
      onCreated={() => account.reload()}
    />
  );
  if (account.isPending || (account.user && account.loading && !account.me)) {
    return <Shell header={header}><Skeleton className="h-40" /></Shell>;
  }
  if (!account.user) return <RedirectToSignIn />;
  const current = (account.me?.memberships ?? []).find((item) => item.businessId === businessId);
  return (
    <Shell header={header}>
      <PanelState.Provider value={{
        businessId,
        memberships: account.me?.memberships ?? [],
        displayName: account.me?.profile.displayName ?? "",
        pageFor: account.me?.profile.pageFor ?? "",
        pageName: account.me?.profile.pageName ?? "",
        role: current?.role ?? "",
        staffId: current?.staffId ?? "",
      }}>
        <Outlet />
      </PanelState.Provider>
    </Shell>
  );
}