import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowDownToLine, ArrowUpFromLine, Wallet as WalletIcon, Copy } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { createNowpaymentsInvoice } from "@/server/nowpayments.functions";

export const Route = createFileRoute("/wallet")({
  head: () => ({ meta: [{ title: "Wallet — Mintograph" }] }),
  component: WalletPage,
});

type Tx = {
  id: string;
  type: string;
  status: string;
  amount_eth: number;
  tx_hash: string | null;
  notes: string | null;
  created_at: string;
};

function WalletPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [txs, setTxs] = useState<Tx[]>([]);
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [minWithdraw, setMinWithdraw] = useState(0.01);
  const [paymentMode, setPaymentMode] = useState<string>("manual");
  const [depositMethod, setDepositMethod] = useState<"manual" | "nowpayments">("manual");
  const createInvoice = useServerFn(createNowpaymentsInvoice);

  // forms
  const [depAmount, setDepAmount] = useState("");
  const [depHash, setDepHash] = useState("");
  const [wdAmount, setWdAmount] = useState("");
  const [wdAddr, setWdAddr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  const loadTxs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("transactions")
      .select("id,type,status,amount_eth,tx_hash,notes,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setTxs((data as Tx[]) ?? []);
  };

  useEffect(() => {
    if (!user) return;
    loadTxs();
    supabase.from("site_settings").select("deposit_wallet_address,min_withdrawal_eth,payment_mode").eq("id", 1).maybeSingle().then(({ data }) => {
      if (data) {
        setDepositAddress(data.deposit_wallet_address);
        setMinWithdraw(Number(data.min_withdrawal_eth) || 0.01);
        setPaymentMode(data.payment_mode || "manual");
        // Default the user's selected method to whatever the admin enables
        if (data.payment_mode === "nowpayments") setDepositMethod("nowpayments");
        else if (data.payment_mode === "manual") setDepositMethod("manual");
      }
    });
  }, [user]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depAmount || Number(depAmount) <= 0) return toast.error("Enter an amount");
    if (!depHash.trim()) return toast.error("Enter the transaction hash");
    setBusy(true);
    const { error } = await supabase.rpc("request_deposit", { _amount: Number(depAmount), _tx_hash: depHash.trim() });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Deposit submitted — pending admin confirmation");
    setDepAmount(""); setDepHash("");
    loadTxs();
  };

  const handleNowpaymentsDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(depAmount);
    if (!amt || amt <= 0) return toast.error("Enter an amount");
    setBusy(true);
    try {
      const result = await createInvoice({ data: { amount_eth: amt, pay_currency: "eth" } });
      if ((result as any)?.error) {
        toast.error((result as any).error);
      } else if ((result as any)?.invoice_url) {
        toast.success("Redirecting to payment...");
        window.location.href = (result as any).invoice_url;
      } else {
        toast.error("Could not create invoice");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create invoice");
    } finally {
      setBusy(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(wdAmount);
    if (!amt || amt <= 0) return toast.error("Enter an amount");
    if (amt < minWithdraw) return toast.error(`Minimum withdrawal is ${minWithdraw} ETH`);
    if (!wdAddr.trim()) return toast.error("Enter your wallet address");
    setBusy(true);
    const { error } = await supabase.rpc("request_withdrawal", { _amount: amt, _wallet: wdAddr.trim() });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Withdrawal requested");
    setWdAmount(""); setWdAddr("");
    await refreshProfile();
    loadTxs();
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex flex-col"><Header />
        <main className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3">
          <WalletIcon className="h-7 w-7 text-primary" />
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Wallet</h1>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-transparent p-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Available Balance</p>
          <p className="font-display text-4xl font-bold mt-1">{Number(profile.balance_eth).toFixed(4)} <span className="text-xl text-muted-foreground">ETH</span></p>
        </div>

        <Tabs defaultValue="deposit" className="mt-8">
          <TabsList>
            <TabsTrigger value="deposit"><ArrowDownToLine className="h-4 w-4 mr-1" />Deposit</TabsTrigger>
            <TabsTrigger value="withdraw"><ArrowUpFromLine className="h-4 w-4 mr-1" />Withdraw</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="mt-6">
            <div className="rounded-2xl border border-border p-6 space-y-4">
              {paymentMode === "both" && (
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant={depositMethod === "manual" ? "default" : "outline"} onClick={() => setDepositMethod("manual")}>Manual ETH</Button>
                  <Button type="button" size="sm" variant={depositMethod === "nowpayments" ? "default" : "outline"} onClick={() => setDepositMethod("nowpayments")}>NOWPayments</Button>
                </div>
              )}

              {depositMethod === "manual" ? (
                <>
                  <div>
                    <p className="text-sm font-medium">Send ETH to this deposit address</p>
                    <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 font-mono text-xs break-all">
                      <span className="flex-1">{depositAddress || "Not configured by admin yet"}</span>
                      {depositAddress && (
                        <button onClick={() => { navigator.clipboard.writeText(depositAddress); toast.success("Copied"); }} className="text-primary hover:opacity-80">
                          <Copy className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <form onSubmit={handleDeposit} className="grid gap-4 sm:grid-cols-2">
                    <Field label="Amount (ETH)" type="number" step="0.0001" min="0" value={depAmount} onChange={(e) => setDepAmount(e.target.value)} placeholder="0.1" />
                    <Field label="Transaction Hash" value={depHash} onChange={(e) => setDepHash(e.target.value)} placeholder="0x..." />
                    <div className="sm:col-span-2 flex justify-end">
                      <Button type="submit" variant="hero" disabled={busy || !depositAddress}>
                        {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Submit Deposit
                      </Button>
                    </div>
                  </form>
                  <p className="text-xs text-muted-foreground">After sending ETH on-chain, paste the transaction hash above. An admin will confirm and credit your balance.</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">Pay with crypto via NOWPayments</p>
                  <p className="text-xs text-muted-foreground">Choose any supported cryptocurrency at checkout. Your balance will be credited automatically once the payment is confirmed.</p>
                  <form onSubmit={handleNowpaymentsDeposit} className="grid gap-4 sm:grid-cols-2">
                    <Field label="Amount (ETH equivalent)" type="number" step="0.0001" min="0" value={depAmount} onChange={(e) => setDepAmount(e.target.value)} placeholder="0.1" />
                    <div className="sm:col-span-2 flex justify-end">
                      <Button type="submit" variant="hero" disabled={busy}>
                        {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Continue to Payment
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="withdraw" className="mt-6">
            <form onSubmit={handleWithdraw} className="rounded-2xl border border-border p-6 grid gap-4 sm:grid-cols-2">
              <Field label={`Amount (ETH) — min ${minWithdraw}`} type="number" step="0.0001" min={minWithdraw} value={wdAmount} onChange={(e) => setWdAmount(e.target.value)} placeholder="0.05" />
              <Field label="Your ETH wallet address" value={wdAddr} onChange={(e) => setWdAddr(e.target.value)} placeholder="0x..." />
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" variant="hero" disabled={busy}>
                  {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Request Withdrawal
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <div className="rounded-2xl border border-border overflow-hidden">
              {txs.length === 0 ? (
                <p className="p-8 text-center text-sm text-muted-foreground">No transactions yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                    <tr><th className="text-left p-3">Type</th><th className="text-left p-3">Amount</th><th className="text-left p-3">Status</th><th className="text-left p-3">Date</th></tr>
                  </thead>
                  <tbody>
                    {txs.map((t) => (
                      <tr key={t.id} className="border-t border-border">
                        <td className="p-3 capitalize">{t.type}</td>
                        <td className="p-3 font-mono">{Number(t.amount_eth).toFixed(4)} ETH</td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === "confirmed" ? "bg-emerald-500/10 text-emerald-600" : t.status === "pending" ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"}`}>{t.status}</span>
                        </td>
                        <td className="p-3 text-muted-foreground">{new Date(t.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <p className="mt-6 text-xs text-muted-foreground">Need to update your profile? <Link to="/settings/profile" className="text-primary hover:underline">Account settings</Link></p>
      </main>
      <Footer />
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