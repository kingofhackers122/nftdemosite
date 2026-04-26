import { Link } from "@tanstack/react-router";
import { Twitter, Github, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/30 mt-24">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground font-bold"
                style={{ background: "var(--gradient-primary)" }}
              >
                M
              </div>
              <span className="font-display text-lg font-bold tracking-tight">
                MINTOGRAPH
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Discover, collect, and sell extraordinary NFTs on the world's first investment-based marketplace.
            </p>
            <div className="mt-4 flex gap-2">
              {[Twitter, Github, Globe].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  aria-label="social"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: "Marketplace", links: ["Explore", "Activity", "Rankings", "Drops"] },
            { title: "Account", links: ["Profile", "Favorites", "Watchlist", "Settings"] },
            { title: "Resources", links: ["Help Center", "Platform Status", "Partners", "Blog"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Mintograph. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for collectors, by collectors.
          </p>
        </div>
      </div>
    </footer>
  );
}