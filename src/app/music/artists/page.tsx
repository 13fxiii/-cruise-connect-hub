'use client';
import { useEffect } from 'react';
export default function MusicArtistsRedirect() {
  useEffect(() => { window.location.replace('/music'); }, []);
  return null;
}
