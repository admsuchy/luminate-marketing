# Luminate Energy Marketing Site

Production marketing site for **Luminate Energy LLC** — `luminate.solar`.

Tech: **Astro 4 + Tailwind CSS 3**. Output is static HTML — deploy to any static host.

---

## Local development

```bash
cd /Users/luminatestudios/Documents/luminate-marketing
npm install         # one-time
npm run dev         # http://localhost:4321
npm run build       # produces ./dist/
npm run preview     # serve ./dist/ locally to verify production output
```

## Project layout

```
luminate-marketing/
├── astro.config.mjs        Astro + Tailwind integration
├── tailwind.config.mjs     Brand tokens (#FF7F00, Helvetica Neue, Instrument Serif)
├── public/
│   ├── favicon.svg         Luminate Star mark
│   ├── robots.txt
│   └── sitemap.xml
└── src/
    ├── styles/global.css   Brand tokens + font imports
    ├── layouts/Layout.astro
    ├── components/
    │   ├── Header.astro
    │   ├── Footer.astro
    │   ├── Logo.astro
    │   ├── CTAButton.astro
    │   ├── ValueCard.astro
    │   └── SectionEyebrow.astro
    └── pages/
        ├── index.astro     Home
        ├── about.astro
        ├── services.astro
        ├── process.astro
        └── contact.astro
```

## Editing content

All copy lives directly in the `.astro` page files — open the file, edit the text, save.
Hot reload picks it up instantly during `npm run dev`.

Brand tokens live in `tailwind.config.mjs` under `theme.extend.colors.brand`.

## Contact form

The contact form is wired to **Web3Forms** (free, no signup needed for setup).

1. Visit https://web3forms.com/ → enter `hello@luminate.solar` (or `adamsuchy@luminate.solar`) → they email you an **access key**.
2. Create a `.env` file in this directory (not committed):
   ```
   PUBLIC_WEB3FORMS_KEY=your-key-here
   ```
3. Rebuild + redeploy. Submissions will arrive in that inbox.

Until the key is set, the form gracefully tells visitors to email `hello@luminate.solar` directly.

## Deployment

See [DEPLOY.md](./DEPLOY.md) for the Cloudflare Pages + GoDaddy DNS playbook.
