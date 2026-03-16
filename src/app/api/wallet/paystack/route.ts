// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_BASE = "https://api.paystack.co";

// POST /api/wallet/paystack?action=initialize
// POST /api/wallet/paystack?action=verify
// POST /api/wallet/paystack?action=withdraw

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (!PAYSTACK_SECRET) {
    return NextResponse.json({ error: "Paystack not configured — add PAYSTACK_SECRET_KEY to env" }, { status: 503 });
  }

  try {
    if (action === "initialize") {
      const { email, amount, metadata } = await req.json();
      if (!email || !amount) return NextResponse.json({ error: "email and amount required" }, { status: 400 });

      const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
        method: "POST",
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amount: amount * 100, // Paystack uses kobo
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet?verify=1`,
          metadata: { ...metadata, channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"] },
        }),
      });
      const data = await res.json();
      if (!data.status) return NextResponse.json({ error: data.message }, { status: 400 });
      return NextResponse.json({ authorization_url: data.data.authorization_url, reference: data.data.reference });
    }

    if (action === "verify") {
      const { reference } = await req.json();
      if (!reference) return NextResponse.json({ error: "reference required" }, { status: 400 });

      const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
      });
      const data = await res.json();

      if (!data.status || data.data.status !== "success") {
        return NextResponse.json({ error: "Payment not verified", status: data.data?.status }, { status: 400 });
      }

      const amountNgn = data.data.amount / 100;
      const userId = data.data.metadata?.user_id;

      if (userId) {
        const supabase = getSupabaseAdmin();
        // Update wallet balance when wallets table exists:
        // await supabase.from("wallets").upsert({ user_id: userId, balance: supabase.raw("balance + ?", [amountNgn]) })
        // await supabase.from("transactions").insert({ user_id: userId, type: "deposit", amount: amountNgn, description: `Wallet top-up via Paystack`, reference, status: "completed" })
      }

      return NextResponse.json({ success: true, amount: amountNgn, reference });
    }

    if (action === "withdraw") {
      const { account_number, bank_code, account_name, amount, user_id } = await req.json();
      if (!account_number || !bank_code || !amount) {
        return NextResponse.json({ error: "account_number, bank_code, and amount required" }, { status: 400 });
      }
      if (amount < 2000) return NextResponse.json({ error: "Minimum withdrawal is ₦2,000" }, { status: 400 });

      // Step 1: Create transfer recipient
      const recipientRes = await fetch(`${PAYSTACK_BASE}/transferrecipient`, {
        method: "POST",
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, "Content-Type": "application/json" },
        body: JSON.stringify({ type: "nuban", name: account_name, account_number, bank_code, currency: "NGN" }),
      });
      const recipient = await recipientRes.json();
      if (!recipient.status) return NextResponse.json({ error: recipient.message }, { status: 400 });

      // Step 2: Initiate transfer
      const transferRes = await fetch(`${PAYSTACK_BASE}/transfer`, {
        method: "POST",
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "balance",
          amount: amount * 100,
          recipient: recipient.data.recipient_code,
          reason: "C&C Hub wallet withdrawal",
        }),
      });
      const transfer = await transferRes.json();
      if (!transfer.status) return NextResponse.json({ error: transfer.message }, { status: 400 });

      return NextResponse.json({ success: true, transfer_code: transfer.data.transfer_code, reference: transfer.data.reference });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

// GET /api/wallet/paystack?action=banks - fetch Nigerian bank list
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "banks") {
    try {
      const res = await fetch(`${PAYSTACK_BASE}/bank?country=nigeria&currency=NGN&perPage=100`, {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
      });
      const data = await res.json();
      return NextResponse.json({ banks: data.data || [] });
    } catch {
      // Fallback bank list if Paystack not configured
      return NextResponse.json({
        banks: [
          { name: "Access Bank", code: "044" }, { name: "GTBank", code: "058" },
          { name: "First Bank", code: "011" }, { name: "Zenith Bank", code: "057" },
          { name: "UBA", code: "033" }, { name: "Opay", code: "999992" },
          { name: "Kuda Bank", code: "090267" }, { name: "PalmPay", code: "999991" },
          { name: "Moniepoint", code: "090405" }, { name: "WEMA Bank", code: "035" },
          { name: "Stanbic IBTC", code: "221" }, { name: "FCMB", code: "214" },
          { name: "Union Bank", code: "032" }, { name: "Fidelity Bank", code: "070" },
        ],
      });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
