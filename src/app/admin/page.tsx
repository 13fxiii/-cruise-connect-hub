import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import { ShieldCheck, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react";
import type { AdSubmission, AdStatus } from "@/types/database";

export const dynamic = "force-dynamic";

const PACKAGE_LABELS: Record<string, string> = {
  day: "1 Day AD", day_dual: "1 Day Dual", weekly: "Weekly",
  monthly: "Monthly", ambassador_3m: "3 Month Deal", ambassador_6m: "6 Month Deal",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-300",
  approved: "bg-blue-500/20 text-blue-300",
  rejected: "bg-red-500/20 text-red-300",
  live: "bg-green-500/20 text-green-300",
  expired: "bg-cch-surface-2 text-cch-muted",
};

async function updateAdStatus(id: string, status: AdStatus) {
  "use server";
  await supabaseAdmin.from("ad_submissions").update({ status }).eq("id", id);
}

export default async function AdminPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/feed");

  const { data: ads } = await supabaseAdmin
    .from("ad_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  const typedAds = (ads || []) as AdSubmission[];

  const pending = typedAds.filter((s) => s.status === "pending").length;
  const revenue = typedAds
    .filter((s) => ["approved", "live"].includes(s.status))
    .reduce((sum, s) => sum + s.amount_ngn, 0);

  return (
    <div className="min-h-screen bg-cch-black">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck size={18} className="text-cch-gold" />
          <h1 className="font-black text-white text-xl">Admin Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Pending Ads", val: pending, icon: Clock, color: "text-yellow-400" },
            { label: "Total Submissions", val: typedAds.length, icon: CheckCircle, color: "text-blue-400" },
            { label: "Est. Revenue", val: `₦${revenue.toLocaleString()}`, icon: DollarSign, color: "text-green-400" },
          ].map((s) => (
            <div key={s.label} className="card">
              <s.icon size={18} className={`${s.color} mb-2`} />
              <div className="text-2xl font-black text-white">{s.val}</div>
              <div className="text-cch-muted text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Ad Submissions Table */}
        <div className="card overflow-hidden">
          <h2 className="font-bold text-white mb-4">Ad Submissions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cch-border text-cch-muted text-xs">
                  <th className="text-left py-2 pr-4">Brand</th>
                  <th className="text-left py-2 pr-4">Package</th>
                  <th className="text-left py-2 pr-4">Amount</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {typedAds.map((ad) => (
                  <tr key={ad.id} className="border-b border-cch-border/50 hover:bg-cch-surface-2/30 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-white">{ad.brand_name}</div>
                      <div className="text-cch-muted text-xs">{ad.contact_email}</div>
                    </td>
                    <td className="py-3 pr-4 text-cch-muted">{PACKAGE_LABELS[ad.package]}</td>
                    <td className="py-3 pr-4 text-cch-gold font-semibold">₦{ad.amount_ngn.toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[ad.status]}`}>
                        {ad.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {ad.status === "pending" && (
                        <div className="flex gap-2">
                          <form action={async () => { "use server"; await updateAdStatus(ad.id, "approved"); }}>
                            <button className="text-green-400 hover:text-green-300 transition-colors" title="Approve">
                              <CheckCircle size={14} />
                            </button>
                          </form>
                          <form action={async () => { "use server"; await updateAdStatus(ad.id, "rejected"); }}>
                            <button className="text-red-400 hover:text-red-300 transition-colors" title="Reject">
                              <XCircle size={14} />
                            </button>
                          </form>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!typedAds.length && (
              <p className="text-center text-cch-muted py-8 text-sm">No submissions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
