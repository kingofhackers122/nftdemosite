import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — Mintograph" },
      { name: "description", content: "Join Mintograph to mint, collect, and trade NFTs." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/profile" });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      toast.error("Username must be 3–20 chars (letters, numbers, _)");
      return;
    }
    setLoading(true);
    const redirectUrl = `${window.location.origin}/profile`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { username, display_name: username },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created — check your email to confirm");
    navigate({ to: "/profile" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div
          className="w-full max-w-md rounded-3xl border border-border p-8 sm:p-10 shadow-[var(--shadow-elevated)]"
          style={{ background: "var(--gradient-card)" }}
        >
          <h1 className="font-display text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start collecting and creating on Mintograph.
          </p>

          <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
            <Field icon={UserIcon} type="text" placeholder="username" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <Field icon={Mail} type="email" placeholder="you@example.com" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Field icon={Lock} type="password" placeholder="At least 6 characters" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account
            </Button>
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
