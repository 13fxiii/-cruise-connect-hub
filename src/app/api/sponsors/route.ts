// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const { data: packages } = await supabaseAdmin
    .from('sponsorship_packages' as any)
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  return NextResponse.json({ packages: packages || [] });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brand_name, contact_name, contact_email, contact_phone, website, industry, campaign_brief, budget_range, package_id } = body;

    if (!brand_name || !contact_name || !contact_email || !campaign_brief)
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const { data, error } = await supabaseAdmin.from('sponsorship_applications' as any).insert({
      package_id: package_id || null,
      brand_name, contact_name, contact_email,
      contact_phone: contact_phone || '',
      website: website || '',
      industry: industry || '',
      campaign_brief, budget_range: budget_range || '',
    }).select().single();

    if (error) throw error;

    // Notify admin
    await supabaseAdmin.from('notifications').insert({
      user_id: '81341f73-3a9b-4f89-abcc-cf49c4f7ce20', // FX admin
      type: 'sponsorship_application',
      title: `💼 New sponsorship application from ${brand_name}`,
      body: campaign_brief.substring(0, 100) + '...',
      link: '/admin',
    });

    return NextResponse.json({ success: true, application: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
