/** Share natively on mobile, fallback to Web Share API, then clipboard */
export async function nativeShare(opts: {
  title: string; text?: string; url?: string;
}): Promise<void> {
  // Capacitor Share
  if (typeof (window as any).Capacitor !== "undefined") {
    try {
      const { Share } = await import("@capacitor/share");
      await Share.share({ title: opts.title, text: opts.text, url: opts.url, dialogTitle: opts.title });
      return;
    } catch { /* fallthrough */ }
  }
  // Web Share API
  if (navigator.share) {
    try { await navigator.share(opts); return; } catch { /* fallthrough */ }
  }
  // Clipboard fallback
  const text = [opts.title, opts.text, opts.url].filter(Boolean).join("\n");
  await navigator.clipboard.writeText(text).catch(() => {});
}
