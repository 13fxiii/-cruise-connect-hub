// @ts-nocheck
export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { z } from "zod";

const PACKAGE_PRICES: Record<string, number> = {
  day: 20000, day_dual: 40000, weekly: 140000,
  monthly: 350000, ambassador_3m: 750000, ambassador_6m: 1500000,
};

const adSchema = z.object({
  brand_name: z.string().min(1).max(100),
  contact_name: z.string().min(1).max(100),
  contact_email: z.string().email(),
  contact_phone: z.string().optional(),
  package: z.enum(["day", "day_dual", "weekly", "monthly", "ambassador_3m", "ambassador_6m"]),
  description: z.string().min(10).max(2000),
  link_url: z.string().url().optional().or(z.literal("")),
  media_url: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const session = await auth();
  const body = await req.json();

  const parsed = adSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const amount_ngn = PACKAGE_PRICES[parsed.data.package];

  const { data, error } = await supabaseAdmin.from("ad_submissions").insert({
    submitter_id: session?.user?.id || null,
    ...parsed.data,
    amount_ngn,
    link_url: parsed.data.link_url || null,
    media_url: parsed.data.media_url || null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // TODO: Send confirmation email via Resend
  return NextResponse.json({ submission: data }, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("ad_submissions")
    .select("*")
    .eq("submitter_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ submissions: data });
}
