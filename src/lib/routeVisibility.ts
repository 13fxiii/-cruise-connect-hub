const HIDDEN_APP_CHROME_PREFIXES = ["/auth", "/onboarding", "/rules"];

export function shouldHideAppChrome(pathname: string | null | undefined) {
  if (!pathname || pathname === "/") return true;
  return HIDDEN_APP_CHROME_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
