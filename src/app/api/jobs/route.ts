// @ts-nocheck
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const type = searchParams.get("type");
  const search = searchParams.get("search");
  try {
    const s = getSupabaseAdmin();
    let q = s.from("jobs").select("*").eq("status","active").order("is_featured",{ascending:false}).order("is_urgent",{ascending:false}).order("created_at",{ascending:false});
    if (category && category !== "All") q = q.eq("category", category);
    if (type && type !== "All Types") q = q.eq("type", type);
    if (search) q = q.or(`title.ilike.%${search}%,company.ilike.%${search}%`);
    const { data, error } = await q.limit(50);
    if (error) throw error;
    return NextResponse.json({ jobs: data||[], total: data?.length||0 });
  } catch {
    return NextResponse.json({ jobs: MOCK_JOBS, total: MOCK_JOBS.length, _source:"mock" });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const s = getSupabaseAdmin();
    const reqArray = (body.requirements||"").split("\n").filter(Boolean);
    const { data, error } = await s.from("jobs").insert({
      ...body, requirements: reqArray, status:"active",
      expires_at: new Date(Date.now()+30*24*60*60*1000).toISOString(),
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ job: data }, { status: 201 });
  } catch {
    return NextResponse.json({ job: null, _source:"mock" }, { status: 201 });
  }
}

const MOCK_JOBS = [
  { id:"1", title:"Social Media Manager", company:"C&C Hub", type:"Part-time", category:"Marketing", location:"Remote", pay:"₦80,000/month", description:"Manage our X, Instagram, and TikTok accounts. Create viral content.", requirements:["2+ years social media experience","Strong X/Twitter knowledge","Video editing skills"], contact_handle:"@TheCruiseCH", is_urgent:true, application_count:12, created_at:new Date().toISOString() },
  { id:"2", title:"Graphic Designer (Freelance)", company:"Lagos Creative Agency", type:"Freelance", category:"Design", location:"Remote", pay:"₦15,000–₦50,000/project", description:"Looking for talented designers for brand identity and social media graphics.", requirements:["Adobe Photoshop/Illustrator","Strong portfolio","Quick turnaround"], contact_handle:"@lagosbrand", is_urgent:false, application_count:8, created_at:new Date(Date.now()-86400000).toISOString() },
  { id:"3", title:"Content Creator / Vlogger", company:"ThrillSeeka Entertainment", type:"Contract", category:"Content", location:"Lagos / Remote", pay:"Revenue share + ₦30,000 base", description:"Create engaging video content for artist promotion campaigns.", requirements:["Video editing (CapCut/Premiere)","Photography skills","Passion for Naija music"], contact_handle:"@ThrillSeekaEnt", is_urgent:false, application_count:5, created_at:new Date(Date.now()-172800000).toISOString() },
  { id:"4", title:"React / Next.js Developer", company:"Naija Startup", type:"Full-time", category:"Tech", location:"Remote (Nigeria)", pay:"₦200,000–₦400,000/month", description:"Join our growing fintech startup as a frontend developer.", requirements:["2+ years React/Next.js","TypeScript proficiency","Supabase or Firebase"], contact_handle:"@naijastartup", is_urgent:true, application_count:21, created_at:new Date(Date.now()-259200000).toISOString() },
  { id:"5", title:"Community Manager", company:"Lagos Brand Co.", type:"Full-time", category:"Marketing", location:"Lagos Island", pay:"₦100,000–₦150,000/month", description:"Build and manage online community across X and Discord.", requirements:["Community management experience","Excellent communication","Data-driven mindset"], contact_handle:"@lagosbrandco", is_urgent:false, application_count:15, created_at:new Date(Date.now()-345600000).toISOString() },
  { id:"6", title:"Music A&R Scout", company:"Independent Label", type:"Contract", category:"Music Industry", location:"Lagos / Abuja", pay:"Commission-based", description:"Discover and pitch emerging Naija artists.", requirements:["Music industry knowledge","Strong network","Ear for talent"], contact_handle:"@indienaija", is_urgent:false, application_count:3, created_at:new Date(Date.now()-432000000).toISOString() },
];
