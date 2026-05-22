# Deploying luminate.solar

Static site → **Cloudflare Pages** (free tier, no credit card required, free SSL, fast CDN).

This guide assumes the site already builds locally — if not, run `npm install && npm run build` first.

---

## 1. Build the site locally

```bash
cd /Users/luminatestudios/Documents/luminate-marketing
npm install            # if you haven't yet
npm run build
```

Output lands in `./dist/`. Keep this folder handy for step 3.

## 2. Create a Cloudflare account (free)

1. Go to https://dash.cloudflare.com/sign-up
2. Sign up with `adamsuchy@luminate.solar` (or your preferred admin email)
3. Verify the email when it arrives

## 3. Create the Pages project + upload `dist/`

1. In the Cloudflare dashboard sidebar → **Workers & Pages** → **Create application** → **Pages** → **Upload assets**
2. Project name: `luminate-marketing` (this becomes your temporary `luminate-marketing.pages.dev` URL)
3. Drag the local `dist/` folder into the upload zone
4. Click **Deploy site**
5. After deploy completes, open the `*.pages.dev` URL Cloudflare gives you and verify all 5 pages load:
   - `/`
   - `/about/`
   - `/services/`
   - `/process/`
   - `/contact/`

## 4. Attach the `luminate.solar` custom domain

> Two valid paths here. Pick **A** unless you have a specific reason to keep DNS at GoDaddy.

### Path A (recommended): move DNS to Cloudflare

This is the cleanest setup. Cloudflare handles DNS, SSL, and the Pages connection automatically — no GoDaddy DNS edits needed every time something changes.

1. In Cloudflare dash → **Websites** → **Add a site** → enter `luminate.solar`
2. Pick the **Free plan**
3. Cloudflare scans existing DNS records. **Critical**: confirm Cloudflare imported:
   - **MX records** for Google Workspace (`aspmx.l.google.com` and 4 others)
   - **SPF TXT** record (starts `v=spf1 include:_spf.google.com`)
   - **DMARC TXT** record on `_dmarc.luminate.solar`
   - Any Google Workspace verification TXT or CNAME
   - The `www` CNAME pointing to `@`

   If any are missing, add them manually before continuing — they keep email working.
4. Cloudflare gives you **2 nameservers** (something like `kate.ns.cloudflare.com` + `tim.ns.cloudflare.com`).
5. Go to GoDaddy → your `luminate.solar` domain → **Nameservers** → **Change** → **I'll use my own nameservers** → paste Cloudflare's two nameservers → save.
6. Propagation takes 1–24 hours (usually <2 hours). Cloudflare emails you when it activates.
7. Back in Cloudflare → **Pages** → your project → **Custom domains** → **Set up a custom domain** → enter `luminate.solar` → Cloudflare auto-creates the DNS record and SSL cert.
8. Repeat for `www.luminate.solar` (or add a redirect rule from `www` → apex).

### Path B: keep DNS at GoDaddy, point only A records

If you'd rather not move nameservers:

1. In Cloudflare Pages project → **Custom domains** → **Set up a custom domain** → `luminate.solar`
2. Cloudflare shows you the **exact CNAME or A records** to add at your DNS host. Copy them.
3. In GoDaddy DNS:
   - **Delete** existing A records on `@` if they point at parking IPs (`76.223.105.230` / `13.248.243.5`)
   - **Add** Cloudflare's A records (or the CNAME they specify)
   - **Leave untouched**: MX records, SPF TXT, DMARC TXT, Google Workspace verification, existing `www` CNAME
4. Wait for DNS propagation (15 min – a few hours)
5. Cloudflare auto-provisions SSL once it sees the new records

## 5. Verify everything

After DNS resolves and SSL is live:

```bash
# A records point at Cloudflare (NOT the parking IPs)
dig +short A luminate.solar @1.1.1.1
dig +short A luminate.solar @8.8.8.8

# Site loads with valid SSL
curl -sI https://luminate.solar/ | head -5

# Email still works (MX records intact)
dig +short MX luminate.solar
```

Manual checks:

- [ ] https://luminate.solar/ loads the new home page
- [ ] All 5 pages reachable via header nav
- [ ] https://www.luminate.solar redirects to (or serves) the apex
- [ ] SSL cert valid in browser (no warnings)
- [ ] Send a test email from `@luminate.solar` and reply to it — confirms inbound+outbound mail
- [ ] Submit the contact form (after setting `PUBLIC_WEB3FORMS_KEY`) and confirm it lands in the destination inbox
- [ ] Lighthouse mobile: 95+ Performance, 95+ Accessibility, 95+ Best Practices, 95+ SEO

## 6. Future updates

Two easy options:

**Option 1 — Drag-and-drop (no git required)**
```bash
npm run build
# Cloudflare Pages → project → Create new deployment → drag dist/
```

**Option 2 — Connect a git repo (auto-deploy on push)**
1. `git init && git add . && git commit -m "initial commit"` in this directory
2. Push to a new GitHub repo
3. Cloudflare Pages → project → Settings → **Connect to Git** → select the repo
4. Build config: build command `npm run build`, output `dist`, Node version `20` (or higher)
5. Every push to `main` auto-deploys. PRs get preview URLs.

---

## Wiring the contact form (Web3Forms)

1. https://web3forms.com/ → enter `support@luminate.solar` (or whichever inbox should receive leads) → submit → check inbox for **access key**
2. In Cloudflare Pages → project → **Settings** → **Environment variables** → add:
   - Variable name: `PUBLIC_WEB3FORMS_KEY`
   - Value: the access key from Web3Forms
   - Save and redeploy
3. Test by submitting the form on `/contact/` — confirm the lead lands in the inbox

## Decommissioning the old WordPress / SiteGround

Leave the old WP site alone until the new site has been live and stable for ~2 weeks. Then:

1. Confirm no DNS records point at the old SiteGround IP (`35.215.121.204`)
2. Confirm no MX / SPF / DMARC depends on SiteGround
3. Cancel SiteGround hosting (only if/when account access is recovered — not blocking)
