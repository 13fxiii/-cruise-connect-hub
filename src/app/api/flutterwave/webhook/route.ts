// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const FLW_SECRET = process.env.FLW_SECRET_KEY || "";
const FLW_WEBHOOK_SECRET = process.env.FLW_WEBHOOK_SECRET || "";
const FLW_BASE = "https://api.flutterwave.com/v3";

async function flwVerifyTransaction(idOrRef: { id?: number; tx_ref?: string }) {
  const path = idOrRef.id
    ? `/transactions/${idOrRef.id}/verify`
    : `/transactions/verify_by_reference?tx_ref=${encodeURIComponent(idOrRef.tx_ref || "")}`;
  const res = await fetch(`${FLW_BASE}${path}`, {
    headers: { Authorization: `Bearer ${FLW_SECRET}` },
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("verif-hash") || "";

  if (FLW_WEBHOOK_SECRET && signature !== FLW_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: any;
  try { event = JSON.parse(rawBody); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const s = getSupabaseAdmin();

  const data = event?.data || {};
  const meta = data?.meta || data?.meta_data || {};

  // Log event
  const eventPayload = {
    event: event.event,
    reference: data?.tx_ref || data?.reference,
    amount: data?.amount,
    email: data?.customer?.email,
    status: data?.status,
    payload: event,
    processed: false,
  };
  await (s as any).from("payment_events").insert(eventPayload);

  // Charge success (wallet funding, orders, ads, tournament)
  if (event.event === "charge.completed" && data?.status?.toLowerCase() === "successful") {
    let verified = true;
    if (FLW_SECRET && (data?.id || data?.tx_ref)) {
      const verify = await flwVerifyTransaction({ id: data?.id, tx_ref: data?.tx_ref });
      verified = verify.ok && verify.data?.data?.status?.toLowerCase() === "successful";
    }
    if (!verified) {
      return NextResponse.json({ received: true });
    }

    const amountNaira = Number(data?.amount || 0);
    const amountKobo = Math.round(amountNaira * 100);
    const reference = data?.tx_ref || data?.reference;
    const userId = meta?.user_id;
    const purpose = meta?.purpose;

    try {
      if (purpose === "wallet_topup" && userId) {
        // Idempotency: insert the wallet transaction first. If it's a duplicate,
        // we skip crediting to avoid double deposits on webhook retries or races
        // with client-side verification.
        const { error: insertErr } = await (s as any).from("wallet_transactions").insert({
          user_id: userId,
          type: "deposit",
          amount: amountKobo,
          description: `Wallet top-up via Flutterwave (₦${amountNaira.toLocaleString()})`,
          reference,
          status: "pending",
          metadata: {
            flw_id: data?.id,
            flw_tx_ref: data?.tx_ref,
          },
        });

        if (insertErr) {
          // 23505 = unique_violation (reference already exists)
          if (insertErr.code === "23505") {
            await (s as any).from("payment_events").update({ processed: true }).eq("reference", reference);
            return NextResponse.json({ received: true });
          }
          throw insertErr;
        }

        const { error: incErr } = await (s as any).rpc("increment_wallet", { user_id: userId, amount_kobo: amountKobo });
        if (incErr) {
          await (s as any).from("wallet_transactions").update({ status: "failed" }).eq("reference", reference).catch(() => {});
          throw incErr;
        }

        await (s as any).from("wallet_transactions").update({ status: "completed" }).eq("reference", reference).catch(() => {});
        await (s as any).from("notifications").insert({
          user_id: userId, type: "wallet_credit",
          title: "Wallet Funded! 💰",
          body: `₦${amountNaira.toLocaleString()} has been added to your wallet.`,
          link: "/wallet",
        });
      }

      if (purpose === "order" && meta?.order_id) {
        await (s as any).from("orders").update({ status: "paid", payment_ref: reference })
          .eq("id", meta.order_id);
        if (userId) {
          await (s as any).from("notifications").insert({
            user_id: userId, type: "system",
            title: "Order Confirmed! 🛍️",
            body: `Your order for ${meta.item_name || "item"} has been confirmed.`,
            link: "/shop/orders",
          });
        }
      }

      if (purpose === "ad_payment" && meta?.ad_id) {
        await (s as any).from("ads_submissions").update({
          payment_confirmed: true, payment_reference: reference, status: "approved",
        }).eq("id", meta.ad_id);
        if (userId) {
          await (s as any).from("notifications").insert({
            user_id: userId, type: "system",
            title: "Ad Campaign Approved! 📢",
            body: `Your ₦${amountNaira.toLocaleString()} ad campaign is now under review.`,
            link: "/ads",
          });
        }
      }

      if (purpose === "tournament_entry" && meta?.tournament_id && userId) {
        await (s as any).from("game_entries").update({ paid: true, paid_at: new Date().toISOString() })
          .eq("game_id", meta.tournament_id).eq("user_id", userId);
        await (s as any).from("notifications").insert({
          user_id: userId, type: "game_start",
          title: "Tournament Entry Confirmed! 🏆",
          body: `You're in! Good luck in the ${meta.tournament_title || "tournament"}.`,
          link: "/games/tournament",
        });
      }

      await (s as any).from("payment_events").update({ processed: true }).eq("reference", reference);
    } catch (err) {
      console.error("Webhook processing error:", err);
    }
  }

  // Transfer success (withdrawal payout)
  if (event.event === "transfer.completed") {
    const status = data?.status?.toLowerCase();
    const reference = data?.reference;
    const amountNaira = Number(data?.amount || 0);
    const amountKobo = Math.round(amountNaira * 100);
    const userId = data?.meta?.user_id || meta?.user_id;
    if (!reference || !userId) return NextResponse.json({ received: true });

    const { data: tx } = await (s as any)
      .from("wallet_transactions")
      .select("id,status")
      .eq("reference", reference)
      .maybeSingle();

    // If we don't have a matching pending transaction, don't try to mutate balances.
    if (!tx?.id) return NextResponse.json({ received: true });

    if (status === "successful") {
      if (tx.status !== "completed") {
        await (s as any).from("wallet_transactions").update({ status: "completed" }).eq("id", tx.id);
        await (s as any).from("notifications").insert({
          user_id: userId,
          type: "system",
          title: "Withdrawal Successful! 🏦",
          body: `₦${amountNaira.toLocaleString()} has been sent to your bank.`,
          link: "/wallet",
        });
      }
    } else if (status === "failed" || status === "cancelled") {
      // Refund if the transfer ultimately failed and we had already reserved funds.
      if (tx.status === "pending") {
        await (s as any).rpc("increment_wallet", { user_id: userId, amount_kobo: amountKobo });
        await (s as any).from("wallet_transactions").update({ status: "failed" }).eq("id", tx.id);
        await (s as any).from("notifications").insert({
          user_id: userId,
          type: "system",
          title: "Withdrawal Failed",
          body: `Your ₦${amountNaira.toLocaleString()} withdrawal failed and was refunded to your wallet.`,
          link: "/wallet",
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
