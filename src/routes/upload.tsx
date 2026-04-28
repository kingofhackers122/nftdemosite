import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ImagePlus, Upload as UploadIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/upload")({
  head: () => ({ meta: [{ title: "Upload NFT — Mintograph" }] }),
  component: UploadPage,
});

type Category = { id: string; name: string };

function UploadPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadFee, setUploadFee] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [collection, setCollection] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<"on_sale" | "draft">("on_sale");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    supabase.from("categories").select("id,name").order("display_order").then(({ data }) => {
      setCategories((data as Category[]) ?? []);
    });
    supabase.from("site_settings").select("upload_fee_eth").eq("id", 1).maybeSingle().then(({ data }) => {
      if (data) setUploadFee(Number(data.upload_fee_eth) || 0);
    });
  }, []);

  const onFile = (f: File | null) => {
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file) {
      toast.error("Please select an image");
      return;
    }
    if (status === "on_sale" && (!price || Number(price) <= 0)) {
      toast.error("Enter a price greater than 0");
      return;
    }
    if (uploadFee > 0 && Number(profile?.balance_eth ?? 0) < uploadFee) {
      toast.error(`You need at least ${uploadFee} ETH in your wallet to upload. Please deposit first.`);
      return;
    }
    setBusy(true);
    try {
      // Charge upload fee atomically (server-side via RPC). Skipped if fee is 0.
      if (uploadFee > 0) {
        const { data: ok, error: feeErr } = await supabase.rpc("charge_upload_fee", { _user_id: user.id });
        if (feeErr) throw feeErr;
        if (!ok) throw new Error("Insufficient balance for upload fee");
      }

      const ext = file.name.split(".").pop() || "png";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("nfts").upload(path, file, { contentType: file.type });
      if (up.error) throw up.error;
      const { data: pub } = supabase.storage.from("nfts").getPublicUrl(path);

      const { error } = await supabase.from("nfts").insert({
        creator_id: user.id,
        owner_id: user.id,
        category_id: categoryId || null,
        name,
        description: description || null,
        image_url: pub.publicUrl,
        collection_name: collection || null,
        price_eth: price ? Number(price) : null,
        status,
      });
      if (error) throw error;

      toast.success("NFT uploaded!");
      await refreshProfile();
      navigate({ to: "/profile" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col"><Header />
        <main className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold">Upload NFT</h1>
        <p className="text-sm text-muted-foreground mt-2">Mint a new item to the marketplace.</p>

        {uploadFee > 0 && (
          <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4 text-sm flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">Upload fee: {uploadFee} ETH</p>
              <p className="text-xs text-muted-foreground mt-0.5">Your balance: {Number(profile?.balance_eth ?? 0).toFixed(4)} ETH</p>
            </div>
            {Number(profile?.balance_eth ?? 0) < uploadFee && (
              <Link to="/wallet" className="text-primary hover:underline text-sm font-medium">Deposit →</Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Image *</span>
              <div className="mt-2 relative aspect-square sm:aspect-video w-full overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/30 hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                  className="absolute inset-0 z-10 cursor-pointer opacity-0"
                />
                {preview ? (
                  <img src={preview} alt="" className="h-full w-full object-contain" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                    <ImagePlus className="h-10 w-10 mb-2" />
                    <p className="text-sm">Click or drop an image (PNG, JPG, GIF)</p>
                  </div>
                )}
              </div>
            </label>
          </div>

          <Field label="Name *" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
          <Field label="Collection" value={collection} onChange={(e) => setCollection(e.target.value)} maxLength={100} placeholder="e.g. Bored Apes" />

          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={4}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Category</span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="">— Select category —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "on_sale" | "draft")}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="on_sale">List for sale</option>
              <option value="draft">Save as draft</option>
            </select>
          </label>

          <Field
            label={`Price (ETH) ${status === "on_sale" ? "*" : ""}`}
            type="number"
            step="0.0001"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required={status === "on_sale"}
            placeholder="0.05"
          />

          <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
            <Button type="button" variant="ghost" onClick={() => navigate({ to: "/profile" })}>Cancel</Button>
            <Button type="submit" variant="hero" size="lg" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UploadIcon className="h-4 w-4 mr-2" />}
              {busy ? "Uploading..." : "Upload NFT"}
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        {...props}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
