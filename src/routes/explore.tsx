import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NftCard } from "@/components/nft/NftCard";
import { Button } from "@/components/ui/button";
import { NFTS, type Nft } from "@/lib/data/nfts";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore NFTs — Mintograph" },
      { name: "description", content: "Browse thousands of NFTs across art, collectibles, gaming, and more." },
      { property: "og:title", content: "Explore NFTs — Mintograph" },
      { property: "og:description", content: "Browse thousands of NFTs on Mintograph." },
    ],
  }),
  component: ExplorePage,
});

const CATEGORIES = ["all", "art", "collectibles", "photography", "sports", "gaming"] as const;
type Category = (typeof CATEGORIES)[number];

const SORTS = [
  { id: "recent", label: "Recently Listed" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
] as const;

function ExplorePage() {
  const [cat, setCat] = useState<Category>("all");
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("recent");

  let items: Nft[] = cat === "all" ? NFTS : NFTS.filter((n) => n.category === cat);
  if (sort === "price-asc") items = [...items].sort((a, b) => a.priceEth - b.priceEth);
  if (sort === "price-desc") items = [...items].sort((a, b) => b.priceEth - a.priceEth);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Marketplace</p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Explore NFTs</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Browse {NFTS.length}+ items from top creators. Filter by category and sort by price.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Button
                key={c}
                variant={cat === c ? "hero" : "outline"}
                size="sm"
                onClick={() => setCat(c)}
                className="capitalize"
              >
                {c}
              </Button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
            No items in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((n) => <NftCard key={n.id} nft={n} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}