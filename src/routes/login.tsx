import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Wallet, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Mintograph" },
      { name: "description", content: "Sign in to your Mintograph account to bid, collect, and create." },
      { property: "og:title", content: "Sign in — Mintograph" },
      { property: "og:description", content: "Access your Mintograph account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div
          className="w-full max-w-md rounded-3xl border border-border p-8 sm:p-10 shadow-[var(--shadow-elevated)]"
          style={{ background: "var(--gradient-card)" }}
        >
          <h1 className="font-display text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue collecting on Mintograph.
          </p>

          <Button variant="hero" size="lg" className="mt-6 w-full">
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Field icon={Mail} type="email" placeholder="you@example.com" label="Email" />
            <Field icon={Lock} type="password" placeholder="••••••••" label="Password" />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="rounded border-border" />
                Remember me
              </label>
              <a href="#" className="text-primary hover:underline">Forgot password?</a>
            </div>

            <Button type="submit" size="lg" className="w-full">Sign in</Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  ...props
}: { icon: React.ComponentType<{ className?: string }>; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="relative mt-1">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          {...props}
          className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary"
        />
      </div>
    </label>
  );
}