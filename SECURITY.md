# BCH Security Policy

## Security boundaries

- Secrets must never be committed to Git or exposed to client bundles.
- AppDeploy is the target runtime and source of backend secrets.
- Supabase is legacy during migration and must not receive new feature dependencies.
- Server-only credentials, including X client secrets and privileged database keys, may only be used in server routes.
- Admin endpoints must authenticate the current user, enforce admin authorization, validate request payloads, and avoid cacheable responses.
- OAuth state and PKCE verifier cookies must be HttpOnly, Secure in production, SameSite protected, short-lived, and host-only.
- External redirects must be restricted to safe relative paths or a configured application origin.

## Migration rule

Do not delete legacy Supabase code until its replacement is implemented in AppDeploy and the affected routes have been verified. New code must use AppDeploy for authentication, database, API, secrets, and realtime functionality where the corresponding capability exists.

## Reporting

Report suspected vulnerabilities privately to the project owner before public disclosure. Do not include credentials, access tokens, or other secrets in issues or pull requests.
