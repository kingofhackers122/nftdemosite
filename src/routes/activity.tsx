import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ACTIVITY, type Activity } from "@/lib/data/nfts";
import { ArrowRight, ShoppingCart, Tag, Gavel, Send } from "lucide-react";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity Feed — Mintograph" },
      { name: "description", content: "Latest sales, bids, listings, and transfers across the marketplace." },
      { property: "og:title", content: "Activity — Mintograph" },
      { property: "og:description", content: "Real-time NFT marketplace activity." },
    ],
  }),
  component: ActivityPage,
});

const FILTERS = ["all", "sale", "bid", "listing", "transfer"] as const;
type Filter = (typeof FILTERS)[number];

const ICONS: Record<Activity["type"], React.ComponentType<{ className?: string }>> = {
  sale: ShoppingCart,
  bid: Gavel,
  listing: Tag,
  transfer: Send,
};

function ActivityPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const items = filter === "all" ? ACTIVITY : ACTIVITY.filter((a) => a.type === filter);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Live Feed</p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Activity</h1>
          <p className="mt-3 text-muted-foreground">
            Real-time sales, bids, listings, and transfers.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f}
              variant={filter === f ? "hero" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <ul className="divide-y divide-border">
            {items.map((a) => {
              const Icon = ICONS[a.type];
              return (
                <li key={a.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/40">
                  <img src={a.nftImage} alt={a.nftName} className="h-14 w-14 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                        <Icon className="h-3 w-3" />
                        {a.type}
                      </span>
                      <p className="truncate font-semibold">{a.nftName}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                      <span className="text-foreground">@{a.from}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="text-foreground">@{a.to}</span>
                      <span className="ml-2">· {a.timeAgo}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-primary">{a.priceEth} ETH</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}