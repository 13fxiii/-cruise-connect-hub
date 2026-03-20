import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://xiyjgcoeljquryixmfut.supabase.co';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpeWpnY29lbGpxdXJ5aXhtZnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NTMzNjAsImV4cCI6MjA4NTEyOTM2MH0.BnVAwvmor0JnjmFn0t4t5lTZU_fIoE3FNl1RYOK1_Hk';

export function createClient() {
  // Pass NO extra auth options — any overrides via mergeDeepRight can
  // accidentally shadow the internal cookie-based PKCE storage adapter
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON);
}
