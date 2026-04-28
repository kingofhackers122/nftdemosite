import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Loader2, Shield } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Mintograph" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (!isAdmin) navigate({ to: "/" });
  }, [loading, user, isAdmin, navigate]);

  if (loading || !user || !isAdmin) {
    return <div className="min-h-screen flex flex-col"><Header /><main className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></main></div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-primary" />
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Admin Panel</h1>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Manage users, NFTs, categories, payments, and site settings.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {["Users", "NFTs", "Categories", "Transactions", "Site Settings", "Payment Settings"].map((s) => (
            <div key={s} className="rounded-2xl border border-border p-6 hover:border-primary/50 transition-colors">
              <p className="font-semibold">{s}</p>
              <p className="text-xs text-muted-foreground mt-1">Coming in next phase</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}