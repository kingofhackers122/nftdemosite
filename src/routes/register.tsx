import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Wallet, Mail, Lock, User } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — Mintograph" },
      { name: "description", content: "Join Mintograph to start discovering, collecting, and creating extraordinary NFTs." },
      { property: "og:title", content: "Create account — Mintograph" },
      { property: "og:description", content: "Join the Mintograph community." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div
          className="w-full max-w-md rounded-3xl border border-border p-8 sm:p-10 shadow-[var(--shadow-elevated)]"
          style={{ background: "var(--gradient-card)" }}
        >
          <h1 className="font-display text-3xl font-bold">Join Mintograph</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your account to start collecting today.
          </p>

          <Button variant="hero" size="lg" className="mt-6 w-full">
            <Wallet className="mr-2 h-4 w-4" />
            Sign up with Wallet
          </Button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Field icon={User} type="text" placeholder="@username" label="Username" />
            <Field icon={Mail} type="email" placeholder="you@example.com" label="Email" />
            <Field icon={Lock} type="password" placeholder="••••••••" label="Password" />

            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input type="checkbox" className="mt-0.5 rounded border-border" />
              <span>
                I agree to the{" "}
                <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
              </span>
            </label>

            <Button type="submit" size="lg" className="w-full">Create account</Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
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