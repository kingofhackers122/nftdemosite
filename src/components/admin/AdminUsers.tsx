import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Ban, CheckCircle2, ShieldCheck, ShieldOff, KeyRound } from "lucide-react";
import { toast } from "sonner";

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  balance_eth: number;
  is_verified: boolean;
  is_banned: boolean;
  created_at: string;
};
type RoleRow = { user_id: string; role: "admin" | "user" };

export function AdminUsers() {
  const [rows, setRows] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Record<string, string[]>>({});
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    let query = supabase.from("profiles").select("id,username,display_name,balance_eth,is_verified,is_banned,created_at").order("created_at", { ascending: false }).limit(100);
    if (q.trim()) query = query.or(`username.ilike.%${q.trim()}%,display_name.ilike.%${q.trim()}%`);
    const { data } = await query;
    setRows((data as Profile[]) ?? []);
    const { data: rs } = await supabase.from("user_roles").select("user_id,role");
    const map: Record<string, string[]> = {};
    (rs as RoleRow[] ?? []).forEach((r) => { (map[r.user_id] ??= []).push(r.role); });
    setRoles(map);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggleField = async (id: string, field: "is_banned" | "is_verified", value: boolean) => {
    const { error } = await supabase.from("profiles").update({ [field]: value }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    load();
  };

  const toggleAdmin = async (id: string, makeAdmin: boolean) => {
    if (makeAdmin) {
      const { error } = await supabase.from("user_roles").insert({ user_id: id, role: "admin" });
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", id).eq("role", "admin");
      if (error) return toast.error(error.message);
    }
    toast.success("Role updated");
    load();
  };

  const sendReset = async (username: string) => {
    // We'd need email — fetch via profiles+admin? Profiles don't store email.
    toast.info(`Use the user's email to send a reset (admin email tools coming with email setup). User: @${username}`);
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by username..." className="flex-1 max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        <Button onClick={load} variant="outline" size="sm">Search</Button>
      </div>
      <div className="rounded-2xl border border-border overflow-x-auto">
        {loading ? <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Username</th><th className="text-left p-3">Balance</th><th className="text-left p-3">Status</th><th className="text-left p-3">Role</th><th className="text-left p-3">Joined</th><th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const isAdmin = (roles[u.id] ?? []).includes("admin");
                return (
                  <tr key={u.id} className="border-t border-border">
                    <td className="p-3">
                      <div className="font-medium">@{u.username}</div>
                      {u.display_name && <div className="text-xs text-muted-foreground">{u.display_name}</div>}
                    </td>
                    <td className="p-3 font-mono">{Number(u.balance_eth).toFixed(4)} ETH</td>
                    <td className="p-3 space-x-1">
                      {u.is_verified && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">verified</span>}
                      {u.is_banned && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-600">banned</span>}
                    </td>
                    <td className="p-3">{isAdmin ? <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">admin</span> : <span className="text-xs text-muted-foreground">user</span>}</td>
                    <td className="p-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      <Button size="sm" variant="ghost" title={u.is_verified ? "Unverify" : "Verify"} onClick={() => toggleField(u.id, "is_verified", !u.is_verified)}>
                        <CheckCircle2 className={`h-4 w-4 ${u.is_verified ? "text-blue-500" : ""}`} />
                      </Button>
                      <Button size="sm" variant="ghost" title={u.is_banned ? "Unban" : "Ban"} onClick={() => toggleField(u.id, "is_banned", !u.is_banned)}>
                        <Ban className={`h-4 w-4 ${u.is_banned ? "text-red-500" : ""}`} />
                      </Button>
                      <Button size="sm" variant="ghost" title={isAdmin ? "Remove admin" : "Make admin"} onClick={() => toggleAdmin(u.id, !isAdmin)}>
                        {isAdmin ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" title="Password reset info" onClick={() => sendReset(u.username)}>
                        <KeyRound className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Passwords are encrypted and never visible — admins can trigger password resets via email instead.</p>
    </div>
  );
}