import { redirect } from 'next/navigation';

export default function ResetPasswordPage() {
  // X-only auth: password resets are not part of the flow anymore.
  redirect('/auth/login');
}
