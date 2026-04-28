import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";

type Nft = {
  id: string;
  name: string;
  image_url: string;
  price_eth: number | null;
  status: string;
  creator_id: string;
  created_at: string;
};

export function AdminNfts() {
  const [rows, setRows] = useState<Nft[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    let query = supabase.from("nfts").select("id,name,image_url,price_eth,status,creator_id,created_at").order("created_at", { ascending: false }).limit(100);
    if (q.trim()) query = query.ilike("name", `%${q.trim()}%`);
    const { data } = await query;
    setRows((data as Nft[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this NFT?")) return;
    const { error } = await supabase.from("nfts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };
  const setStatus = async (id: string, status: "on_sale" | "unlisted") => {
    const { error } = await supabase.from("nfts").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    load();
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name..." className="flex-1 max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        <Button onClick={load} variant="outline" size="sm">Search</Button>
      </div>
      <div className="rounded-2xl border border-border overflow-x-auto">
        {loading ? <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr><th className="text-left p-3"></th><th className="text-left p-3">Name</th><th className="text-left p-3">Price</th><th className="text-left p-3">Status</th><th className="text-left p-3">Date</th><th className="text-right p-3">Actions</th></tr>
            </thead>
            <tbody>
              {rows.map((n) => (
                <tr key={n.id} className="border-t border-border">
                  <td className="p-3"><img src={n.image_url} alt="" className="h-10 w-10 rounded object-cover" /></td>
                  <td className="p-3 font-medium">{n.name}</td>
                  <td className="p-3 font-mono">{n.price_eth ? `${n.price_eth} ETH` : "—"}</td>
                  <td className="p-3 text-xs capitalize">{n.status.replace("_", " ")}</td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-right space-x-1 whitespace-nowrap">
                    {n.status === "on_sale" ? (
                      <Button size="sm" variant="ghost" title="Unlist" onClick={() => setStatus(n.id, "unlisted")}><EyeOff className="h-4 w-4" /></Button>
                    ) : (
                      <Button size="sm" variant="ghost" title="Re-list" onClick={() => setStatus(n.id, "on_sale")}><Eye className="h-4 w-4" /></Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove(n.id)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}