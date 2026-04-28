import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Loader2, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminNfts } from "@/components/admin/AdminNfts";
import { AdminCategories } from "@/components/admin/AdminCategories";
import { AdminTransactions } from "@/components/admin/AdminTransactions";
import { AdminSettings } from "@/components/admin/AdminSettings";

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
    return (
      <div className="min-h-screen flex flex-col"><Header />
        <main className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-primary" />
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Admin Panel</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Manage users, NFTs, categories, transactions and site settings.</p>

        <Tabs defaultValue="transactions" className="mt-8">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="nfts">NFTs</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="settings">Site Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-6"><AdminTransactions /></TabsContent>
          <TabsContent value="users" className="mt-6"><AdminUsers /></TabsContent>
          <TabsContent value="nfts" className="mt-6"><AdminNfts /></TabsContent>
          <TabsContent value="categories" className="mt-6"><AdminCategories /></TabsContent>
          <TabsContent value="settings" className="mt-6"><AdminSettings /></TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}