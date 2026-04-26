import { Link } from "@tanstack/react-router";
import { Search, Wallet, Menu, Wallet as WalletIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/activity", label: "Activity" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
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

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "text-foreground bg-muted" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden flex-1 max-w-md md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search items, collections, accounts..."
              className="w-full rounded-full border border-border bg-muted/50 py-2 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Button size="sm" variant="hero" className="hidden sm:inline-flex">
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetHeader className="border-b border-border/40 p-4">
                <SheetTitle className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground font-bold text-sm"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    M
                  </div>
                  <span className="font-display text-base font-bold tracking-tight">
                    MINTOGRAPH
                  </span>
                </SheetTitle>
              </SheetHeader>

              <div className="p-4">
                <div className="relative w-full mb-4">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search..."
                    className="w-full rounded-full border border-border bg-muted/50 py-2 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>

                <nav className="flex flex-col gap-1">
                  {NAV.map((n) => (
                    <Link
                      key={n.to}
                      to={n.to}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                      activeProps={{ className: "text-foreground bg-muted" }}
                      activeOptions={{ exact: n.to === "/" }}
                    >
                      {n.label}
                    </Link>
                  ))}
                  <div className="my-3 h-px bg-border/60" />
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    Register
                  </Link>
                </nav>

                <Button variant="hero" className="mt-6 w-full">
                  <WalletIcon className="mr-2 h-4 w-4" />
                  Connect Wallet
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}