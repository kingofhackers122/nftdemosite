import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NftCard } from "@/components/nft/NftCard";
import { Button } from "@/components/ui/button";
import { NFTS } from "@/lib/data/nfts";
import { Heart, Share2, Eye, Clock, Tag } from "lucide-react";

export const Route = createFileRoute("/item/$id")({
  loader: ({ params }) => {
    const nft = NFTS.find((n) => n.id === params.id);
    if (!nft) throw notFound();
    return { nft };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.nft.name} — Mintograph` },
          { name: "description", content: `${loaderData.nft.name} by @${loaderData.nft.creator}. Listed at ${loaderData.nft.priceEth} ETH.` },
          { property: "og:title", content: `${loaderData.nft.name} — Mintograph` },
          { property: "og:description", content: `By @${loaderData.nft.creator} · ${loaderData.nft.priceEth} ETH` },
          { property: "og:image", content: loaderData.nft.image },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:image", content: loaderData.nft.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <h1 className="font-display text-4xl font-bold">Item not found</h1>
          <p className="mt-2 text-muted-foreground">This NFT doesn't exist or was removed.</p>
          <Link to="/explore" className="mt-4 inline-block">
            <Button variant="hero">Back to Explore</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-8 text-center text-destructive">{error.message}</div>
  ),
  component: ItemPage,
});

function ItemPage() {
  const { nft } = Route.useLoaderData();
  const related = NFTS.filter((n) => n.id !== nft.id && n.collection === nft.collection).slice(0, 4);
  const more = related.length > 0 ? related : NFTS.filter((n) => n.id !== nft.id).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-elevated)]">
            <img src={nft.image} alt={nft.name} className="aspect-square w-full object-cover" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {nft.collection}
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground capitalize">
                {nft.category}
              </span>
            </div>

            <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">{nft.name}</h1>

            <div className="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> 1.2k views</span>
              <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" /> 234 likes</span>
            </div>

            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
              <img src={nft.creatorAvatar} alt={nft.creator} className="h-12 w-12 rounded-full border border-border" />
              <div>
                <p className="text-xs text-muted-foreground">Creator</p>
                <p className="font-semibold">@{nft.creator}</p>
              </div>
            </div>

            <div
              className="mt-6 rounded-2xl border border-border p-6"
              style={{ background: "var(--gradient-card)" }}
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Auction ends in
              </div>
              <div className="mt-3 flex gap-3">
                {[
                  { v: "02", l: "Days" },
                  { v: "14", l: "Hrs" },
                  { v: "37", l: "Min" },
                  { v: "08", l: "Sec" },
                ].map((t) => (
                  <div key={t.l} className="flex-1 rounded-xl bg-background p-3 text-center">
                    <p className="font-display text-2xl font-bold text-primary">{t.v}</p>
                    <p className="text-xs text-muted-foreground">{t.l}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Current Bid</p>
                  <p className="font-display text-3xl font-bold text-primary">{nft.priceEth} ETH</p>
                  <p className="text-xs text-muted-foreground mt-1">≈ ${(nft.priceEth * 3200).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" aria-label="Like"><Heart className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" aria-label="Share"><Share2 className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="hero" size="lg">
                  <Tag className="mr-2 h-4 w-4" /> Place Bid
                </Button>
                <Button variant="outline" size="lg">Buy Now</Button>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-card p-6">
              <h3 className="font-semibold">Description</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                A unique piece from the {nft.collection} collection. Each item is 1-of-1 on the Ethereum blockchain, verified and minted on Mintograph.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold">More from this collection</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {more.map((n) => <NftCard key={n.id} nft={n} />)}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}