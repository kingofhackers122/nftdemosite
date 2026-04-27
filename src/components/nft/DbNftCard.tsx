import { Link } from "@tanstack/react-router";
import { Heart, Eye } from "lucide-react";

export type DbNft = {
  id: string;
  name: string;
  image_url: string;
  price_eth: number | null;
  status: string;
  collection_name: string | null;
  view_count: number;
  like_count: number;
  creator?: { username: string; avatar_url: string | null } | null;
};

export function DbNftCard({ nft }: { nft: DbNft }) {
  return (
    <Link
      to="/item/$id"
      params={{ id: nft.id }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={nft.image_url}
          alt={nft.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{nft.name}</h3>
            {nft.collection_name && (
              <p className="truncate text-xs text-muted-foreground">
                {nft.collection_name}
              </p>
            )}
          </div>
          {nft.price_eth != null && (
            <div className="text-right shrink-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Price</p>
              <p className="text-sm font-bold text-primary">{Number(nft.price_eth).toFixed(2)} Ξ</p>
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {nft.view_count}</span>
          <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {nft.like_count}</span>
          <span className={
            nft.status === "on_sale" ? "rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium" :
            nft.status === "sold" ? "rounded-full bg-muted px-2 py-0.5 font-medium" :
            "rounded-full bg-muted px-2 py-0.5 font-medium"
          }>
            {nft.status === "on_sale" ? "On Sale" : nft.status === "sold" ? "Sold" : nft.status === "draft" ? "Draft" : "Unlisted"}
          </span>
        </div>
      </div>
    </Link>
  );
}
