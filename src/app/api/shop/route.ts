import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const featured = url.searchParams.get("featured") === "1";

  let query = supabase
    .from("shop_products")
    .select("*, profiles(username, display_name, avatar_url)")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (category && category !== "all") query = query.eq("category", category);
  if (featured) query = query.eq("is_featured", true);

  const { data, error } = await query.limit(40);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data || [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (body.action === "order") {
    const { product_id, quantity = 1, address } = body;
    const { data: product } = await supabase.from("shop_products").select("price, stock").eq("id", product_id).single();
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const total = product.price * quantity;
    const { data: order, error } = await supabase.from("orders").insert({
      buyer_id: user.id, product_id, quantity, total_amount: total, address: address || {}
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ order });
  }

  if (body.action === "list") {
    const { name, description, price, category, images = [] } = body;
    const { data, error } = await supabase.from("shop_products").insert({
      seller_id: user.id, name, description, price, category, images
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ product: data });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
