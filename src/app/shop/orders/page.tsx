"use client";
import { useState } from "react";
import { ShoppingBag, Package, Truck, CheckCircle, Clock, XCircle, ArrowLeft, ExternalLink } from "lucide-react";

import Link from "next/link";

const MOCK_ORDERS = [
  { id:"ord-1", item_name:"BIG CRUISE Tee — Design A (Black)", size:"L", quantity:1, total_naira:12000, status:"shipped", delivery_city:"Lagos", created_at:"2025-03-01T10:00:00Z" },
  { id:"ord-2", item_name:"C&C Hub Cap", size:"One Size", quantity:2, total_naira:17000, status:"paid", delivery_city:"Abuja", created_at:"2025-03-03T14:00:00Z" },
  { id:"ord-3", item_name:"Community Sticker Pack (5pcs)", size:null, quantity:1, total_naira:2500, status:"delivered", delivery_city:"Port Harcourt", created_at:"2025-02-20T09:00:00Z" },
];

const STATUS_META: Record<string, {label:string;color:string;icon:React.ReactNode}> = {
  pending_payment: { label:"Awaiting Payment", color:"text-orange-400 bg-orange-400/10 border-orange-400/30", icon:<Clock className="w-4 h-4"/> },
  paid:            { label:"Payment Confirmed", color:"text-blue-400 bg-blue-400/10 border-blue-400/30", icon:<CheckCircle className="w-4 h-4"/> },
  processing:      { label:"Processing", color:"text-yellow-400 bg-yellow-400/10 border-yellow-400/30", icon:<Package className="w-4 h-4"/> },
  shipped:         { label:"Shipped", color:"text-purple-400 bg-purple-400/10 border-purple-400/30", icon:<Truck className="w-4 h-4"/> },
  delivered:       { label:"Delivered ✓", color:"text-green-400 bg-green-400/10 border-green-400/30", icon:<CheckCircle className="w-4 h-4"/> },
  cancelled:       { label:"Cancelled", color:"text-red-400 bg-red-400/10 border-red-400/30", icon:<XCircle className="w-4 h-4"/> },
};

function timeAgo(iso: string) {
  const d = Math.floor((Date.now()-new Date(iso).getTime())/86400000);
  return d===0?"Today":d===1?"Yesterday":`${d} days ago`;
}

export default function OrdersPage() {
  const [orders] = useState(MOCK_ORDERS);
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/shop" className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm">
          <ArrowLeft className="w-4 h-4"/> Back to Shop
        </Link>
        <h1 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
          <ShoppingBag className="text-yellow-400 w-7 h-7"/> My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 text-zinc-700 mx-auto mb-4"/>
            <p className="text-zinc-400">No orders yet. <Link href="/shop" className="text-yellow-400 hover:underline">Shop now →</Link></p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(o => {
              const meta = STATUS_META[o.status] || STATUS_META["paid"];
              return (
                <div key={o.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="font-bold text-white">{o.item_name}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {o.size && `Size: ${o.size} · `}Qty: {o.quantity} · {o.delivery_city} · {timeAgo(o.created_at)}
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border flex-shrink-0 ${meta.color}`}>
                      {meta.icon} {meta.label}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white">₦{o.total_naira.toLocaleString()}</span>
                    <div className="flex gap-2">
                      <span className="text-xs text-zinc-600">#{o.id}</span>
                      <a href="https://twitter.com/TheCruiseCH" target="_blank" rel="noopener noreferrer"
                        className="text-xs text-yellow-400 hover:underline flex items-center gap-1">
                        Support <ExternalLink className="w-3 h-3"/>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-sm text-zinc-400">
          <p className="font-bold text-white mb-1">Delivery Info</p>
          <p>Lagos: 2–4 business days · Abuja/PH: 3–5 days · Other states: 5–7 days.</p>
          <p className="mt-1">Questions? DM <a href="https://twitter.com/TheCruiseCH" className="text-yellow-400">@TheCruiseCH</a> on X.</p>
        </div>
      </main>
    </div>
  );
}
