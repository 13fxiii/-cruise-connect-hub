import { Suspense } from 'react';
import SignupForm from './SignupForm';

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-black flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full" /></div>}>
      <SignupForm />
    </Suspense>
  );
}
