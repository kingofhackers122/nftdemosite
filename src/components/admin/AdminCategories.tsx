import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Cat = { id: string; name: string; slug: string; description: string | null; display_order: number };

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function AdminCategories() {
  const [rows, setRows] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("display_order");
    setRows((data as Cat[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = slugify(name);
    if (!slug) return toast.error("Enter a name");
    const { error } = await supabase.from("categories").insert({ name: name.trim(), slug, description: desc.trim() || null, display_order: rows.length });
    if (error) return toast.error(error.message);
    toast.success("Category added");
    setName(""); setDesc("");
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="rounded-2xl border border-border overflow-hidden">
        {loading ? <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : rows.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No categories yet.</p> : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground"><tr><th className="text-left p-3">Name</th><th className="text-left p-3">Slug</th><th className="text-right p-3"></th></tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-xs text-muted-foreground font-mono">{c.slug}</td>
                  <td className="p-3 text-right"><Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <form onSubmit={add} className="rounded-2xl border border-border p-5 space-y-3 h-fit">
        <h3 className="font-semibold text-sm">Add category</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Photography" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)" rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        <Button type="submit" variant="hero" className="w-full"><Plus className="h-4 w-4 mr-1" />Add</Button>
      </form>
    </div>
  );
}