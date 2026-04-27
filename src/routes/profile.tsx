import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DbNftCard, type DbNft } from "@/components/nft/DbNftCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, BadgeCheck, Wallet as WalletIcon, Settings, Loader2, Upload } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "My Profile — Mintograph" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [created, setCreated] = useState<DbNft[]>([]);
  const [sold, setSold] = useState<DbNft[]>([]);
  const [onSale, setOnSale] = useState<DbNft[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setBusy(true);
      const [c, s, o] = await Promise.all([
        supabase.from("nfts").select("*").eq("creator_id", user.id).order("created_at", { ascending: false }),
        supabase.from("nfts").select("*").eq("creator_id", user.id).eq("status", "sold").order("sold_at", { ascending: false }),
        supabase.from("nfts").select("*").eq("owner_id", user.id).eq("status", "on_sale").order("created_at", { ascending: false }),
      ]);
      setCreated((c.data as DbNft[]) ?? []);
      setSold((s.data as DbNft[]) ?? []);
      setOnSale((o.data as DbNft[]) ?? []);
      setBusy(false);
    })();
  }, [user]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  const initial = (profile.display_name || profile.username).charAt(0).toUpperCase();
  const joined = new Date(profile.id ? (user?.created_at ?? Date.now()) : Date.now()).toLocaleDateString(
    undefined,
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Banner */}
        <div
          className="relative h-48 sm:h-64 w-full bg-cover bg-center"
          style={{
            backgroundImage: profile.banner_url
              ? `url(${profile.banner_url})`
              : "var(--gradient-primary)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative">
          {/* Avatar + identity */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-end gap-4">
              <div
                className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl border-4 border-background overflow-hidden flex items-center justify-center text-4xl font-bold text-primary-foreground shadow-[var(--shadow-elevated)]"
                style={{ background: "var(--gradient-primary)" }}
              >
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              <div className="pb-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-2">
                  {profile.display_name || profile.username}
                  {profile.is_verified && <BadgeCheck className="h-6 w-6 text-primary" />}
                </h1>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/upload"><Button size="sm" variant="hero"><Upload className="h-4 w-4 mr-2" />Upload NFT</Button></Link>
              <Link to="/wallet"><Button size="sm" variant="outline"><WalletIcon className="h-4 w-4 mr-2" />Wallet</Button></Link>
              <Link to="/settings/profile"><Button size="sm" variant="ghost"><Settings className="h-4 w-4 mr-2" />Edit</Button></Link>
            </div>
          </div>

          {/* Bio + meta */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2 rounded-2xl border border-border p-4 bg-card">
              <p className="text-sm text-muted-foreground">
                {profile.bio || "No bio yet. Tell the world about yourself in Edit Profile."}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" /> Joined {joined}
              </div>
            </div>
            <div className="rounded-2xl border border-border p-4 bg-card">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Balance</p>
              <p className="font-display text-2xl font-bold text-primary mt-1">
                {Number(profile.balance_eth).toFixed(4)} ETH
              </p>
              <Link to="/wallet" className="text-xs text-primary hover:underline mt-2 inline-block">Manage funds →</Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 mb-16">
            <Tabs defaultValue="created">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="created">Created ({created.length})</TabsTrigger>
                <TabsTrigger value="sold">Sold ({sold.length})</TabsTrigger>
                <TabsTrigger value="onsale">On Sale ({onSale.length})</TabsTrigger>
              </TabsList>
              {busy ? (
                <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : (
                <>
                  <TabsContent value="created" className="mt-6">
                    <NftGrid items={created} emptyText="You haven't created any NFTs yet." cta />
                  </TabsContent>
                  <TabsContent value="sold" className="mt-6">
                    <NftGrid items={sold} emptyText="No NFTs sold yet." />
                  </TabsContent>
                  <TabsContent value="onsale" className="mt-6">
                    <NftGrid items={onSale} emptyText="Nothing currently listed for sale." cta />
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function NftGrid({ items, emptyText, cta }: { items: DbNft[]; emptyText: string; cta?: boolean }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">{emptyText}</p>
        {cta && (
          <Link to="/upload" className="mt-4 inline-block">
            <Button variant="hero" size="sm"><Upload className="h-4 w-4 mr-2" />Upload your first NFT</Button>
          </Link>
        )}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((n) => <DbNftCard key={n.id} nft={n} />)}
    </div>
  );
}
