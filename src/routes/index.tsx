import { createFileRoute, Link } from "@tanstack/react-router";
import { Rocket, PenSquare, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NftCard } from "@/components/nft/NftCard";
import { Button } from "@/components/ui/button";
import { NFTS, SELLERS, COLLECTIONS } from "@/lib/data/nfts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mintograph — Discover, collect, and sell extraordinary NFTs" },
      {
        name: "description",
        content:
          "Explore the world's first investment-based NFT marketplace. Live auctions, top sellers, and trending collections.",
      },
      { property: "og:title", content: "Mintograph — Extraordinary NFTs" },
      {
        property: "og:description",
        content:
          "Discover, collect, and sell extraordinary NFTs on Mintograph.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const liveAuctions = NFTS.slice(0, 8);
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Section
          eyebrow="Auctions"
          title="Live Auctions"
          action={
            <Link to="/explore">
              <Button variant="ghost" size="sm">
                Explore <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          }
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {liveAuctions.map((n) => (
              <NftCard key={n.id} nft={n} />
            ))}
          </div>
        </Section>

        <Section eyebrow="Trending Sales" title="Top Sellers">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SELLERS.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
              >
                <span className="font-display text-lg font-bold text-muted-foreground w-6">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <img src={s.avatar} alt={s.handle} className="h-12 w-12 rounded-full border border-border" />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold">@{s.handle}</p>
                  <p className="text-xs text-muted-foreground">
                    Volume: ${s.volumeUsd.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            ))}
          </div>
        </Section>

        <Section eyebrow="Most Popular" title="Popular Collections" action={
          <Link to="/explore">
            <Button variant="ghost" size="sm">
              Explore More <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        }>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {COLLECTIONS.map((c) => (
              <Link
                key={c.id}
                to="/explore"
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/50"
              >
                <div className="aspect-[16/9] overflow-hidden bg-muted">
                  <img
                    src={c.cover}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold">{c.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {c.itemCount.toLocaleString()} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Floor</p>
                    <p className="text-sm font-bold text-primary">{c.floorEth} ETH</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Section>

        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section
      className="relative overflow-hidden border-b border-border/40"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              MINTOGRAPH
            </div>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Discover, collect, and sell{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                extraordinary NFTs
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Explore the world's first investment-based Minto Graph. Bid on live auctions, follow top creators, and own your digital story.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/explore">
                <Button variant="hero" size="lg">
                  <Rocket className="mr-2 h-4 w-4" />
                  Explore
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                <PenSquare className="mr-2 h-4 w-4" />
                Create
              </Button>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-6 max-w-md">
              {[
                { label: "Artworks", value: "98K+" },
                { label: "Auctions", value: "12K+" },
                { label: "Artists", value: "4.2K" },
              ].map((s) => (
                <div key={s.label}>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</dt>
                  <dd className="mt-1 font-display text-2xl font-bold">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {NFTS.slice(0, 4).map((n, i) => (
                <div
                  key={n.id}
                  className={`overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] ${
                    i % 2 === 0 ? "translate-y-6" : ""
                  }`}
                >
                  <img src={n.image} alt={n.name} className="aspect-square w-full object-cover" />
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold">{n.name}</p>
                    <p className="text-xs text-primary">{n.priceEth} ETH</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Section({
  eyebrow,
  title,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div
        className="overflow-hidden rounded-3xl border border-border p-10 sm:p-16 text-center"
        style={{ background: "var(--gradient-hero)" }}
      >
        <h2 className="font-display text-3xl font-bold sm:text-5xl">
          Start your NFT journey today
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Join thousands of collectors and creators shaping the next generation of digital ownership.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/register">
            <Button variant="hero" size="lg">Get Started</Button>
          </Link>
          <Link to="/explore">
            <Button variant="outline" size="lg">Browse Items</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
