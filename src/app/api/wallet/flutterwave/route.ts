// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase";

const FLW_SECRET = process.env.FLW_SECRET_KEY || "";
const FLW_BASE = "https://api.flutterwave.com/v3";
const DEFAULT_CURRENCY = process.env.FLW_CURRENCY || "NGN";
const MIN_WITHDRAWAL_NGN = Number(process.env.MIN_WITHDRAWAL_NGN || process.env.NEXT_PUBLIC_MIN_WITHDRAWAL || 2000);

function makeTxRef(prefix = "cchub") {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}

async function flwRequest(path: string, init: RequestInit = {}) {
  const res = await fetch(`${FLW_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${FLW_SECRET}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

// POST /api/wallet/flutterwave?action=initialize
// POST /api/wallet/flutterwave?action=verify
// POST /api/wallet/flutterwave?action=withdraw
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  const origin = req.nextUrl.origin;

  if (!FLW_SECRET) {
    return NextResponse.json({ error: "Flutterwave not configured — add FLW_SECRET_KEY to env" }, { status: 503 });
  }

  try {
    if (action === "initialize") {
      const { email, amount, currency, metadata, name, phone, tx_ref } = await req.json();
      if (!email || !amount) return NextResponse.json({ error: "email and amount required" }, { status: 400 });

      const txRef = tx_ref || metadata?.tx_ref || makeTxRef();
      const curr = currency || DEFAULT_CURRENCY;

      const payload = {
        tx_ref: txRef,
        amount,
        currency: curr,
        redirect_url: `${origin}/wallet?verify=1&tx_ref=${encodeURIComponent(txRef)}`,
        payment_options: "card,ussd,banktransfer",
        customer: {
          email,
          name: name || email,
          phonenumber: phone,
        },
        meta: metadata || {},
      };

      const { ok, data } = await flwRequest("/payments", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!ok || !data?.data?.link) {
        return NextResponse.json({ error: data?.message || "Flutterwave init failed", details: data }, { status: 400 });
      }

      return NextResponse.json({
        authorization_url: data.data.link,
        payment_link: data.data.link,
        tx_ref: txRef,
      });
    }

    if (action === "verify") {
      const { tx_ref, transaction_id, amount, currency } = await req.json();
      if (!tx_ref && !transaction_id) {
        return NextResponse.json({ error: "tx_ref or transaction_id required" }, { status: 400 });
      }

      const path = transaction_id
        ? `/transactions/${transaction_id}/verify`
        : `/transactions/verify_by_reference?tx_ref=${encodeURIComponent(tx_ref)}`;

      const { ok, data } = await flwRequest(path, { method: "GET" });
      if (!ok) return NextResponse.json({ error: data?.message || "Verify failed", details: data }, { status: 400 });

      const tx = data?.data;
      const isSuccessful = tx?.status?.toLowerCase() === "successful";
      if (!isSuccessful) {
        return NextResponse.json({ error: "Payment not verified", status: tx?.status }, { status: 400 });
      }

      if (amount && Number(tx?.amount) !== Number(amount)) {
        return NextResponse.json({ error: "Amount mismatch", expected: amount, actual: tx?.amount }, { status: 400 });
      }
      if (currency && tx?.currency && tx.currency !== currency) {
        return NextResponse.json({ error: "Currency mismatch", expected: currency, actual: tx?.currency }, { status: 400 });
      }

      const verifiedTxRef = tx?.tx_ref || tx_ref;
      const meta = tx?.meta || tx?.meta_data || tx?.metadata || {};
      const purpose = meta?.purpose;
      const targetUserId = meta?.user_id;

      // Optional: credit wallet immediately after a successful verification.
      // Webhooks should still be configured; this is a safe fallback for UX reliability.
      let credited = false;
      let credit_status: string | undefined;

      if (purpose === "wallet_topup" && verifiedTxRef && targetUserId) {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user?.id !== targetUserId) {
          credit_status = "user_mismatch";
        } else {
          const amountNaira = Number(tx?.amount || amount || 0);
          const amountKobo = Math.round(amountNaira * 100);

          const { error: insertErr } = await (supabaseAdmin as any).from("wallet_transactions").insert({
            user_id: user.id,
            type: "deposit",
            amount: amountKobo,
            description: `Wallet top-up via Flutterwave (₦${amountNaira.toLocaleString()})`,
            reference: verifiedTxRef,
            status: "pending",
            metadata: {
              flw_id: tx?.id,
              flw_tx_ref: tx?.tx_ref,
            },
          });

          if (insertErr) {
            if (insertErr.code === "23505") {
              credit_status = "already_credited";
            } else {
              credit_status = "tx_insert_failed";
            }
          } else {
            const { error: incErr } = await (supabaseAdmin as any).rpc("increment_wallet", {
              user_id: user.id,
              amount_kobo: amountKobo,
            });

            if (incErr) {
              credit_status = "increment_failed";
              await (supabaseAdmin as any)
                .from("wallet_transactions")
                .update({ status: "failed" })
                .eq("reference", verifiedTxRef)
                .catch(() => {});
            } else {
              credited = true;
              credit_status = "credited";
              await (supabaseAdmin as any)
                .from("wallet_transactions")
                .update({ status: "completed" })
                .eq("reference", verifiedTxRef)
                .catch(() => {});
              await (supabaseAdmin as any).from("notifications").insert({
                user_id: user.id,
                type: "wallet_credit",
                title: "Wallet Funded! 💰",
                body: `₦${amountNaira.toLocaleString()} has been added to your wallet.`,
                link: "/wallet",
              }).catch(() => {});
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        tx_ref: verifiedTxRef,
        transaction_id: tx?.id,
        amount: tx?.amount,
        currency: tx?.currency,
        credited,
        credit_status,
      });
    }

    if (action === "withdraw") {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { account_number, bank_code, account_name, amount, currency } = await req.json();
      const amountNaira = Number(amount);

      if (!account_number || !bank_code || !Number.isFinite(amountNaira) || amountNaira <= 0) {
        return NextResponse.json({ error: "account_number, bank_code, and amount required" }, { status: 400 });
      }
      if (amountNaira < MIN_WITHDRAWAL_NGN) {
        return NextResponse.json({ error: `Minimum withdrawal is ₦${MIN_WITHDRAWAL_NGN.toLocaleString()}` }, { status: 400 });
      }

      const amountKobo = Math.round(amountNaira * 100);

      const { data: profile, error: profErr } = await (supabaseAdmin as any)
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user.id)
        .maybeSingle();

      if (profErr) return NextResponse.json({ error: profErr.message || "Unable to load wallet" }, { status: 500 });
      if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 400 });

      const balance = Number(profile.wallet_balance || 0);
      if (balance < amountKobo) {
        return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
      }

      const reference = makeTxRef("withdraw");
      const curr = currency || DEFAULT_CURRENCY;

      // Reserve funds + create a pending wallet transaction before initiating the transfer.
      await (supabaseAdmin as any).from("wallet_transactions").insert({
        user_id: user.id,
        type: "withdrawal",
        amount: -amountKobo,
        description: `Withdrawal via Flutterwave (₦${amountNaira.toLocaleString()})`,
        reference,
        status: "pending",
        metadata: {
          bank_code,
          account_number,
          account_name,
        },
      });

      await (supabaseAdmin as any).rpc("increment_wallet", { user_id: user.id, amount_kobo: -amountKobo });

      const payload = {
        account_bank: bank_code,
        account_number,
        amount: amountNaira,
        currency: curr,
        narration: "C&C Hub wallet withdrawal",
        reference,
        beneficiary_name: account_name,
        meta: { user_id: user.id },
      };

      const { ok, data } = await flwRequest("/transfers", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!ok || !data?.data?.id) {
        // Refund and mark failed if transfer couldn't be created.
        await (supabaseAdmin as any).rpc("increment_wallet", { user_id: user.id, amount_kobo: amountKobo }).catch(() => {});
        await (supabaseAdmin as any)
          .from("wallet_transactions")
          .update({ status: "failed" })
          .eq("reference", reference)
          .catch(() => {});
        return NextResponse.json({ error: data?.message || "Transfer failed", details: data }, { status: 400 });
      }

      await (supabaseAdmin as any)
        .from("wallet_transactions")
        .update({
          metadata: {
            bank_code,
            account_number,
            account_name,
            transfer_id: data.data.id,
            flw_status: data.data.status,
          },
        })
        .eq("reference", reference)
        .catch(() => {});

      return NextResponse.json({
        success: true,
        transfer_id: data.data.id,
        reference: data.data.reference || reference,
        status: data.data.status,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

// GET /api/wallet/flutterwave?action=banks - fetch Nigerian bank list
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (!FLW_SECRET) {
    return NextResponse.json({ error: "Flutterwave not configured — add FLW_SECRET_KEY to env" }, { status: 503 });
  }

  if (action === "resolve") {
    const accountNumber = searchParams.get("account_number");
    const accountBank = searchParams.get("account_bank");
    if (!accountNumber || !accountBank) {
      return NextResponse.json({ error: "account_number and account_bank required" }, { status: 400 });
    }
    try {
      const path = `/accounts/resolve?account_number=${encodeURIComponent(accountNumber)}&account_bank=${encodeURIComponent(accountBank)}`;
      const { ok, data } = await flwRequest(path, { method: "GET" });
      if (!ok) return NextResponse.json({ error: data?.message || "Unable to resolve account" }, { status: 400 });
      return NextResponse.json({ account_name: data?.data?.account_name, raw: data?.data || {} });
    } catch {
      return NextResponse.json({ error: "Unable to resolve account" }, { status: 500 });
    }
  }

  if (action === "banks") {
    try {
      const { ok, data } = await flwRequest("/banks/NG", { method: "GET" });
      if (!ok) return NextResponse.json({ error: data?.message || "Unable to fetch banks" }, { status: 400 });
      return NextResponse.json({ banks: data.data || [] });
    } catch {
      return NextResponse.json({ error: "Unable to fetch banks" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
