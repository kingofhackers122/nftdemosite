import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings/security")({
  component: SecuritySettings,
});

function SecuritySettings() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return toast.error("Password must be at least 8 characters");
    if (pw !== pw2) return toast.error("Passwords don't match");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password changed");
    setPw(""); setPw2("");
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleChangePassword} className="rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-semibold">Change password</h2>
        <Field label="New password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={8} />
        <Field label="Confirm new password" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} required minLength={8} />
        <div className="flex justify-end">
          <Button type="submit" variant="hero" disabled={busy}>{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Update password</Button>
        </div>
      </form>

      <section className="rounded-2xl border border-border p-6">
        <h2 className="font-semibold">Sessions</h2>
        <p className="text-sm text-muted-foreground mt-1">Sign out of this device.</p>
        <div className="mt-4">
          <Button variant="outline" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>Sign out</Button>
        </div>
      </section>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input {...props} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
    </label>
  );
}