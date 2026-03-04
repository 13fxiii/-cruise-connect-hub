import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

const SECRET = process.env.PAYSTACK_SECRET_KEY || "";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") || "";

  // Verify webhook signature
  if (SECRET) {
    const hash = createHmac("sha512", SECRET).update(rawBody).digest("hex");
    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let event: any;
  try { event = JSON.parse(rawBody); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const s = getSupabaseAdmin();

  // Log the event
  await (s as any).from("paystack_events").insert({
    event: event.event, reference: event.data?.reference,
    amount: event.data?.amount, email: event.data?.customer?.email,
    status: event.data?.status, payload: event, processed: false,
  });

  // Handle charge.success
  if (event.event === "charge.success" && event.data?.status === "success") {
    const { reference, amount, metadata } = event.data;
    const amountNaira = Math.floor(amount / 100);
    const userId = metadata?.user_id;
    const purpose = metadata?.purpose; // 'wallet_topup' | 'order' | 'ad_payment' | 'tournament_entry'

    try {
      if (purpose === "wallet_topup" && userId) {
        // Credit user wallet
        await (s as any).rpc("increment_wallet", { user_id: userId, amount_kobo: amount });
        // Record transaction
        await (s as any).from("transactions").insert({
          user_id: userId, type: "deposit",
          amount, description: `Wallet top-up via Paystack (₦${amountNaira.toLocaleString()})`,
          reference, status: "completed",
        });
        // Notify user
        await (s as any).from("notifications").insert({
          user_id: userId, type: "wallet_credit",
          title: "Wallet Funded! 💰",
          body: `₦${amountNaira.toLocaleString()} has been added to your wallet.`,
          link: "/wallet",
        });
      }

      if (purpose === "order" && metadata?.order_id) {
        // Mark order as paid
        await (s as any).from("orders").update({ status: "paid", payment_ref: reference })
          .eq("id", metadata.order_id);
        if (userId) {
          await (s as any).from("notifications").insert({
            user_id: userId, type: "system",
            title: "Order Confirmed! 🛍️",
            body: `Your order for ${metadata.item_name || "item"} has been confirmed.`,
            link: "/shop/orders",
          });
        }
      }

      if (purpose === "ad_payment" && metadata?.ad_id) {
        await (s as any).from("ads_submissions").update({
          payment_confirmed: true, payment_reference: reference, status: "approved",
        }).eq("id", metadata.ad_id);
        if (userId) {
          await (s as any).from("notifications").insert({
            user_id: userId, type: "system",
            title: "Ad Campaign Approved! 📢",
            body: `Your ₦${amountNaira.toLocaleString()} ad campaign is now under review.`,
            link: "/ads",
          });
        }
      }

      if (purpose === "tournament_entry" && metadata?.tournament_id && userId) {
        await (s as any).from("game_entries").update({ paid: true, paid_at: new Date().toISOString() })
          .eq("game_id", metadata.tournament_id).eq("user_id", userId);
        await (s as any).from("notifications").insert({
          user_id: userId, type: "game_start",
          title: "Tournament Entry Confirmed! 🏆",
          body: `You're in! Good luck in the ${metadata.tournament_title || "tournament"}.`,
          link: "/games/tournament",
        });
      }

      // Mark event as processed
      await (s as any).from("paystack_events").update({ processed: true }).eq("reference", reference);

    } catch (err) {
      console.error("Webhook processing error:", err);
    }
  }

  // Transfer success (withdrawal payout)
  if (event.event === "transfer.success") {
    const { reference, amount, recipient } = event.data;
    const userId = event.data?.metadata?.user_id;
    if (userId) {
      await (s as any).from("transactions").update({ status: "completed" }).eq("reference", reference);
      await (s as any).from("notifications").insert({
        user_id: userId, type: "wallet_credit",
        title: "Withdrawal Successful! 🏦",
        body: `₦${Math.floor(amount / 100).toLocaleString()} has been sent to your bank.`,
        link: "/wallet",
      });
    }
  }

  return NextResponse.json({ received: true });
}

// GET not allowed
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
