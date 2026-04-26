import { Link } from "@tanstack/react-router";
import type { Nft } from "@/lib/data/nfts";

export function NftCard({ nft }: { nft: Nft }) {
  return (
    <Link
      to="/item/$id"
      params={{ id: nft.id }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-[var(--shadow-card)]"
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={nft.image}
          alt={nft.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-display text-base font-bold">{nft.name}</h3>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={nft.creatorAvatar}
              alt={nft.creator}
              className="h-6 w-6 rounded-full border border-border"
            />
            <span className="truncate text-xs text-muted-foreground">@{nft.creator}</span>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-sm font-bold text-primary">{nft.priceEth} ETH</p>
          </div>
        </div>
      </div>
    </Link>
  );
}