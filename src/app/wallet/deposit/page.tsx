'use client';
import { useEffect } from 'react';
export default function WalletDepositRedirect() {
  useEffect(() => { window.location.replace('/wallet'); }, []);
  return null;
}
