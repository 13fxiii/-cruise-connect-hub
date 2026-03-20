// @ts-nocheck
'use client';
import { useEffect } from 'react';
export default function ShopRedirect() {
  useEffect(() => { window.location.replace('/marketplace?tab=merch'); }, []);
  return null;
}
