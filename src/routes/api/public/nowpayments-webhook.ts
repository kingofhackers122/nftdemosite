import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createHmac, timingSafeEqual } from "crypto";

// NOWPayments IPN docs: HMAC-SHA512 of the JSON body sorted alphabetically by keys,
// using the IPN secret. Sent in `x-nowpayments-sig` header.
function sortObject(obj: any): any {
  if (Array.isArray(obj)) return obj.map(sortObject);
  if (obj && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce((acc: any, key) => {
        acc[key] = sortObject(obj[key]);
        return acc;
      }, {});
  }
  return obj;
}

export const Route = createFileRoute("/api/public/nowpayments-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
        if (!ipnSecret) {
          return new Response("IPN secret not configured", { status: 500 });
        }

        const signature = request.headers.get("x-nowpayments-sig");
        const rawBody = await request.text();

        if (!signature) {
          return new Response("Missing signature", { status: 401 });
        }

        // Verify HMAC-SHA512 over sorted JSON
        let payload: any;
        try {
          payload = JSON.parse(rawBody);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const sortedString = JSON.stringify(sortObject(payload));
        const expected = createHmac("sha512", ipnSecret).update(sortedString).digest("hex");

        try {
          const a = Buffer.from(signature, "hex");
          const b = Buffer.from(expected, "hex");
          if (a.length !== b.length || !timingSafeEqual(a, b)) {
            return new Response("Invalid signature", { status: 401 });
          }
        } catch {
          return new Response("Invalid signature", { status: 401 });
        }

        // Look up the transaction by order_id (our internal tx id)
        const orderId: string | undefined = payload.order_id;
        const paymentStatus: string | undefined = payload.payment_status;
        if (!orderId) {
          return new Response("Missing order_id", { status: 400 });
        }

        const { data: tx, error: txErr } = await supabaseAdmin
          .from("transactions")
          .select("id,user_id,status,amount_eth,type")
          .eq("id", orderId)
          .maybeSingle();

        if (txErr || !tx) {
          return new Response("Transaction not found", { status: 404 });
        }

        // Idempotency: only act on pending deposits
        if (tx.type !== "deposit") {
          return new Response("Not a deposit", { status: 400 });
        }

        if (paymentStatus === "finished" || paymentStatus === "confirmed") {
          if (tx.status === "confirmed") {
            return new Response("Already confirmed", { status: 200 });
          }
          // Credit balance
          const { data: prof } = await supabaseAdmin
            .from("profiles")
            .select("balance_eth")
            .eq("id", tx.user_id)
            .single();
          const newBal = Number(prof?.balance_eth ?? 0) + Number(tx.amount_eth);
          await supabaseAdmin
            .from("profiles")
            .update({ balance_eth: newBal })
            .eq("id", tx.user_id);
          await supabaseAdmin
            .from("transactions")
            .update({
              status: "confirmed",
              tx_hash: payload.payin_hash ?? payload.outcome?.hash ?? null,
              notes: `NOWPayments confirmed (payment_id: ${payload.payment_id ?? "n/a"})`,
            })
            .eq("id", tx.id);
        } else if (
          paymentStatus === "failed" ||
          paymentStatus === "expired" ||
          paymentStatus === "refunded"
        ) {
          await supabaseAdmin
            .from("transactions")
            .update({
              status: "failed",
              notes: `NOWPayments ${paymentStatus}`,
            })
            .eq("id", tx.id);
        }
        // Other statuses (waiting, confirming, sending, partially_paid) — leave pending

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
