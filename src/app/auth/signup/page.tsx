import { redirect } from 'next/navigation';

export default function SignupPage() {
  // X-only auth: keep /auth/signup for old links, but route everyone to /auth/login.
  redirect('/auth/login');
}
