import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  amount_eth: z.number().positive().max(1000),
  pay_currency: z.string().min(2).max(20).default("eth"),
});

export const createNowpaymentsInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) {
      return { error: "NOWPayments not configured. Add NOWPAYMENTS_API_KEY in secrets." };
    }

    // Pre-create a pending transaction so the webhook can reconcile by tx id
    const { data: tx, error: txErr } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        type: "deposit",
        status: "pending",
        amount_eth: data.amount_eth,
        payment_provider: "nowpayments",
        notes: "NOWPayments invoice (awaiting payment)",
      })
      .select("id")
      .single();

    if (txErr || !tx) {
      return { error: txErr?.message ?? "Failed to create transaction" };
    }

    // Build callback / success / cancel URLs from request origin
    const origin = (() => {
      try {
        const url = new URL((globalThis as any).location?.href ?? "");
        return url.origin;
      } catch {
        return process.env.APP_URL ?? "";
      }
    })();

    const ipnCallbackUrl =
      (process.env.APP_URL ?? origin) + "/api/public/nowpayments-webhook";

    const body = {
      price_amount: data.amount_eth,
      price_currency: "eth",
      pay_currency: data.pay_currency,
      order_id: tx.id,
      order_description: `Mintograph wallet deposit (${data.amount_eth} ETH)`,
      ipn_callback_url: ipnCallbackUrl,
      success_url: (process.env.APP_URL ?? origin) + "/wallet?deposit=success",
      cancel_url: (process.env.APP_URL ?? origin) + "/wallet?deposit=cancel",
    };

    const res = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("NOWPayments invoice error:", res.status, errText);
      return { error: `NOWPayments error: ${res.status}` };
    }

    const invoice = (await res.json()) as { id?: string; invoice_url?: string };

    if (invoice.id) {
      await supabase
        .from("transactions")
        .update({ provider_payment_id: invoice.id, nowpayments_payment_id: invoice.id })
        .eq("id", tx.id);
    }

    return { invoice_url: invoice.invoice_url, tx_id: tx.id };
  });
