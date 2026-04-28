import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings/profile")({
  component: ProfileSettings,
});

function ProfileSettings() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setDisplayName(profile.display_name ?? "");
      setBio(profile.bio ?? "");
      setWalletAddress(profile.wallet_address ?? "");
    }
  }, [profile]);

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${user.id}/avatar.${ext}`;
      const up = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type, upsert: true });
      if (up.error) throw up.error;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${pub.publicUrl}?t=${Date.now()}`;
      const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
      if (error) throw error;
      toast.success("Avatar updated");
      await refreshProfile();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally { setBusy(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({
      username: username.trim(),
      display_name: displayName.trim() || null,
      bio: bio.trim() || null,
      wallet_address: walletAddress.trim() || null,
    }).eq("id", user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    await refreshProfile();
  };

  if (loading || !profile) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border p-6">
        <h2 className="font-semibold">Avatar</h2>
        <div className="mt-4 flex items-center gap-4">
          <div className="h-20 w-20 rounded-full overflow-hidden bg-muted ring-2 ring-border">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-muted-foreground">{(profile.display_name ?? profile.username).charAt(0).toUpperCase()}</div>}
          </div>
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }} />
            <span className="inline-flex items-center px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted">Change avatar</span>
          </label>
        </div>
      </section>

      <form onSubmit={handleSave} className="rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-semibold">Profile info</h2>
        <Field label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required maxLength={50} />
        <Field label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={80} />
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Bio</span>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} rows={4} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
        </label>
        <Field label="Default ETH wallet address" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} placeholder="0x..." />
        <div className="flex justify-end">
          <Button type="submit" variant="hero" disabled={busy}>{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save changes</Button>
        </div>
      </form>

      <section className="rounded-2xl border border-border p-6">
        <h2 className="font-semibold">Account</h2>
        <p className="text-sm text-muted-foreground mt-1">Email: <span className="text-foreground">{user?.email}</span></p>
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