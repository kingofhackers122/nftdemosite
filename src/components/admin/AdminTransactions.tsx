import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type Tx = {
  id: string;
  user_id: string;
  type: string;
  status: string;
  amount_eth: number;
  tx_hash: string | null;
  notes: string | null;
  payment_provider: string | null;
  created_at: string;
};

export function AdminTransactions() {
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [txs, setTxs] = useState<Tx[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("transactions")
      .select("id,user_id,type,status,amount_eth,tx_hash,notes,payment_provider,created_at")
      .order("created_at", { ascending: false }).limit(100);
    if (filter === "pending") q = q.eq("status", "pending");
    const { data } = await q;
    const list = (data as Tx[]) ?? [];
    setTxs(list);
    const ids = [...new Set(list.map((t) => t.user_id))];
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id,username").in("id", ids);
      const map: Record<string, string> = {};
      (profs ?? []).forEach((p) => { map[p.id] = p.username; });
      setUsernames(map);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const confirmDeposit = async (id: string) => {
    const { error } = await supabase.rpc("admin_confirm_deposit", { _tx_id: id });
    if (error) return toast.error(error.message);
    toast.success("Deposit confirmed and balance credited");
    load();
  };
  const reject = async (id: string) => {
    const reason = window.prompt("Reason for rejecting?") ?? "";
    const { error } = await supabase.rpc("admin_reject_transaction", { _tx_id: id, _reason: reason });
    if (error) return toast.error(error.message);
    toast.success("Transaction rejected");
    load();
  };
  const markPaid = async (id: string) => {
    const hash = window.prompt("Enter ETH transaction hash") ?? "";
    if (!hash.trim()) return;
    const { error } = await supabase.rpc("admin_mark_withdrawal_paid", { _tx_id: id, _hash: hash.trim() });
    if (error) return toast.error(error.message);
    toast.success("Withdrawal marked as paid");
    load();
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Button size="sm" variant={filter === "pending" ? "default" : "outline"} onClick={() => setFilter("pending")}>Pending</Button>
        <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
      </div>
      <div className="rounded-2xl border border-border overflow-x-auto">
        {loading ? <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : txs.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No transactions.</p> : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">User</th><th className="text-left p-3">Type</th><th className="text-left p-3">Amount</th>
                <th className="text-left p-3">Status</th><th className="text-left p-3">Tx Hash / Notes</th><th className="text-left p-3">Date</th><th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t.id} className="border-t border-border align-top">
                  <td className="p-3">@{usernames[t.user_id] ?? t.user_id.slice(0, 8)}</td>
                  <td className="p-3 capitalize">{t.type}</td>
                  <td className="p-3 font-mono">{Number(t.amount_eth).toFixed(4)}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === "confirmed" ? "bg-emerald-500/10 text-emerald-600" : t.status === "pending" ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"}`}>{t.status}</span>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground max-w-xs">
                    {t.tx_hash && <a href={`https://etherscan.io/tx/${t.tx_hash}`} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-1 hover:underline break-all">{t.tx_hash.slice(0, 12)}...<ExternalLink className="h-3 w-3" /></a>}
                    {t.notes && <p className="break-words">{t.notes}</p>}
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">{new Date(t.created_at).toLocaleString()}</td>
                  <td className="p-3 text-right space-x-1">
                    {t.status === "pending" && t.type === "deposit" && (
                      <Button size="sm" variant="outline" onClick={() => confirmDeposit(t.id)}><Check className="h-3 w-3 mr-1" />Credit</Button>
                    )}
                    {t.status === "pending" && t.type === "withdrawal" && (
                      <Button size="sm" variant="outline" onClick={() => markPaid(t.id)}><Check className="h-3 w-3 mr-1" />Mark Paid</Button>
                    )}
                    {t.status === "pending" && (
                      <Button size="sm" variant="ghost" onClick={() => reject(t.id)}><X className="h-3 w-3 mr-1" />Reject</Button>
                    )}
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