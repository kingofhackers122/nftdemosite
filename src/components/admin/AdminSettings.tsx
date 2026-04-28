import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

type Settings = {
  site_name: string;
  site_email: string | null;
  deposit_wallet_address: string | null;
  payment_mode: string;
  nowpayments_enabled: boolean;
  upload_fee_eth: number;
  min_withdrawal_eth: number;
  platform_fee_percent: number;
};

export function AdminSettings() {
  const [s, setS] = useState<Settings | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => {
      setS(data as Settings);
    });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!s) return;
    setBusy(true);
    const { error } = await supabase.from("site_settings").update(s).eq("id", 1);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Settings saved");
  };

  if (!s) return <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <form onSubmit={save} className="space-y-6 max-w-3xl">
      <Section title="Site">
        <Field label="Site name"><input value={s.site_name} onChange={(e) => setS({ ...s, site_name: e.target.value })} className={inputCls} required /></Field>
        <Field label="Site email (sender)"><input type="email" value={s.site_email ?? ""} onChange={(e) => setS({ ...s, site_email: e.target.value })} placeholder="hello@yoursite.com" className={inputCls} /></Field>
      </Section>

      <Section title="Payments">
        <Field label="Deposit ETH wallet (where users send deposits)"><input value={s.deposit_wallet_address ?? ""} onChange={(e) => setS({ ...s, deposit_wallet_address: e.target.value })} placeholder="0x..." className={inputCls} /></Field>
        <Field label="Default payment mode">
          <select value={s.payment_mode} onChange={(e) => setS({ ...s, payment_mode: e.target.value })} className={inputCls}>
            <option value="manual">Manual ETH (admin confirms)</option>
            <option value="nowpayments">NOWPayments (automatic)</option>
            <option value="both">Both (user chooses)</option>
          </select>
        </Field>
        <Field label="">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={s.nowpayments_enabled} onChange={(e) => setS({ ...s, nowpayments_enabled: e.target.checked })} />
            Enable NOWPayments (requires API key configured)
          </label>
        </Field>
      </Section>

      <Section title="Fees">
        <Field label="NFT upload fee (ETH)"><input type="number" step="0.0001" min="0" value={s.upload_fee_eth} onChange={(e) => setS({ ...s, upload_fee_eth: Number(e.target.value) })} className={inputCls} /></Field>
        <Field label="Minimum withdrawal (ETH)"><input type="number" step="0.0001" min="0" value={s.min_withdrawal_eth} onChange={(e) => setS({ ...s, min_withdrawal_eth: Number(e.target.value) })} className={inputCls} /></Field>
        <Field label="Platform fee on sales (%)"><input type="number" step="0.1" min="0" max="100" value={s.platform_fee_percent} onChange={(e) => setS({ ...s, platform_fee_percent: Number(e.target.value) })} className={inputCls} /></Field>
      </Section>

      <div className="flex justify-end">
        <Button type="submit" variant="hero" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Save settings</Button>
      </div>
    </form>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border p-6 space-y-4">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
      <div className={label ? "mt-1" : ""}>{children}</div>
    </label>
  );
}