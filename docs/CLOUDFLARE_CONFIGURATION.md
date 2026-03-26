# Cloudflare Configuration for SBALI

Apply these rules in the Cloudflare dashboard for `sbali.in`.

## Cache Rules

### Rule 1: Public Settings API (Edge Cache)`r`n`r`n- **When**: URI Path starts with `/api/v1/settings/public``r`n`r`n- **AND**: Request Header `Authorization` is empty`r`n`r`n- **Then**: Cache eligible, Edge TTL = 5 minutes, Browser TTL = 1 minute`r`n`r`n- **Bypass**: When `Authorization` header is present

### Rule 2: Next.js Static Assets (Immutable)`r`n`r`n- **When**: URI Path starts with `/_next/static/``r`n`r`n- **Then**: Cache eligible, Edge TTL = 1 year (31536000s)`r`n`r`n- **Browser TTL**: 1 year

### Rule 3: Next.js Image Optimization`r`n`r`n- **When**: URI Path starts with `/_next/image``r`n`r`n- **Then**: Cache eligible, Edge TTL = 7 days

### Rule 4: MinIO/CDN Images`r`n`r`n- **When**: Hostname equals `cdn.sbali.in``r`n`r`n- **AND**: Request Method equals `GET``r`n`r`n- **Then**: Cache eligible, Edge TTL = 7 days

## Transform Rules (Response Headers)

### Rule 1: Immutable Static Assets`r`n`r`n- **When**: URI Path contains `/_next/static/``r`n`r`n- **Set Response Header**: `Cache-Control` = `public, max-age=31536000, immutable`

## WAF Custom Rules

### Rule 1: Admin Route Protection
```
Expression: (http.request.uri.path contains "/admin/" and not http.cookie contains "accessToken")
Action: Block
```

### Rule 2: Auth Rate Limiting
```
Expression: (http.request.uri.path contains "/api/v1/auth/")
Rate: 50 requests per minute per IP
Action: Block for 60 seconds
```

## Security Settings

- **Bot Fight Mode**: Enabled
- **DNSSEC**: Enabled
- **Browser Integrity Check**: Enabled
- **Under Attack Mode**: Available via API toggle from admin dashboard

## Turnstile Setup

1. Go to Cloudflare Dashboard → Turnstile
2. Add site: `sbali.in`
3. Widget type: **Managed** (invisible for most users)
4. Copy Site Key → set as `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in frontend env
5. Copy Secret Key → set as `TURNSTILE_SECRET_KEY` in backend env

## R2 / MinIO CDN

If keeping MinIO, point `cdn.sbali.in` CNAME to MinIO's public endpoint.
Cloudflare will cache all GET requests per Rule 4 above.

If migrating to R2:
1. Create R2 buckets: `sbali-products`, `sbali-media`, `sbali-reviews`, `sbali-temp`
2. Enable public access on `sbali-products` and `sbali-media`
3. Connect custom domain `cdn.sbali.in` to R2 bucket
4. Update `MINIO_ENDPOINT` and credentials to R2's S3-compatible API
5. Zero egress fees, built-in Cloudflare CDN

