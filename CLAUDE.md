# HorecaAI — Project context voor Claude Code

## Stack
- Next.js 15 App Router, TypeScript strict mode
- Neon Postgres + Drizzle ORM (schema in `src/lib/db/schema.ts`)
- Clerk voor auth (multi-tenant via organizations)
- Stripe voor betalingen (Stripe Connect voor restaurant-uitbetalingen)
- HeyGen voor welkomstvideo's (pre-rendered .mp4 op Vercel Blob)
- Anthropic Claude Haiku voor real-time upsell-suggesties
- Pusher voor realtime order-updates (keuken + gast)
- Vercel Blob voor media-opslag (menu-afbeeldingen, video's)
- PostHog voor analytics (GDPR-compliant, self-hosted optie)
- UploadThing voor afbeelding-uploads in het dashboard

## Mapstructuur

```
src/
  app/
    [slug]/tafel/[tableId]/   ← gast bestelflow (public, geen auth)
      page.tsx                ← welkomstvideo + menu + cart
      bevestiging/page.tsx    ← bevestiging + realtime status
    dashboard/                ← restaurant-eigenaar (Clerk auth vereist)
      page.tsx                ← omzet overzicht
      menu/page.tsx           ← menu-items beheren
      tafels/page.tsx         ← tafels + QR-codes
      avatar/page.tsx         ← HeyGen avatar instellen
      medewerkers/page.tsx    ← rollen beheren
      instellingen/page.tsx   ← restaurant-instellingen
    keuken/                   ← keukenscherm PWA (Clerk auth, rol: keuken)
      page.tsx
    onboarding/               ← wizard bij eerste keer inloggen
      page.tsx
    api/
      orders/route.ts
      upsell/route.ts         ← Claude Haiku call
      menu-items/route.ts
      webhooks/
        stripe/route.ts
        clerk/route.ts
  lib/
    db/
      schema.ts               ← Drizzle schema (alle tabellen)
      index.ts                ← Neon + Drizzle client
    heygen.ts                 ← HeyGen API wrapper
    stripe.ts                 ← Stripe client + helpers
    pusher.ts                 ← Pusher server + client
    upsell.ts                 ← Claude Haiku upsell logica
    qr.ts                     ← QR-code generatie
  components/
    guest/                    ← gast-kant components
    dashboard/                ← dashboard components
    keuken/                   ← keukenscherm components
    ui/                       ← gedeelde UI (buttons, modals, etc.)
```

## Conventies — STRIKT NALEVEN

- **Prijzen ALTIJD in centen** (integer), nooit float. `price_cents: 350` = €3,50
- **Datums ALTIJD `timestamptz`**, timezone Europe/Amsterdam default
- **API routes** in `/api/[resource]/route.ts`
- **Server Actions** alleen voor dashboard-formulieren (niet voor gast-flow)
- **Gast-routes zijn volledig public** (geen auth-check), dashboard vereist Clerk session
- **Taal**: variabelnamen EN, comments EN, UI-teksten NL
- **Drizzle**: gebruik `.returning()` na elke `insert()` en `update()`
- **Geen `any` types** — TypeScript strict, alle types expliciet
- **Geen useEffect voor data fetching** — gebruik Next.js Server Components
- **Geen class components** — altijd function components + hooks

## Multi-tenant architectuur

- Elk restaurant is een Clerk Organization
- `restaurant_id` ophalen via: `getRestaurantByClerkOrgId(auth().orgId)`
- **ELKE** query op restaurant-data filtert op `restaurant_id`
- Neon Row Level Security is ingesteld als extra veiligheidslaag
- Nooit data van andere restaurants tonen — dit is kritisch

## Rollen (Clerk + eigen enum)

| Rol | Toegang |
|-----|---------|
| owner | Alles inclusief facturatie en avatar |
| manager | Menu, orders, tafels, medewerkers — geen facturatie |
| keuken | Alleen /keuken scherm |
| kelner | Bestellingen inzien + status updaten |

## Gast-flow — exacte volgorde

1. QR scan → `/[slug]/tafel/[tableId]`
2. Restaurant + tafel valideren (404 als niet bestaat of gesloten)
3. Welkomstvideo laden (pre-rendered .mp4 van Vercel Blob, gekozen op tijdslot)
4. Skip-knop na 3 seconden
5. Menu tonen (categorieën + items, gefilterd op is_available=true)
6. Gast selecteert items + varianten + opmerkingen
7. Upsell-stap: `/api/upsell` → Claude Haiku → 2-3 upsell-items tonen
8. Besteloverzicht + fooi-suggestie (5% / 10% / geen)
9. Betaling via Stripe Checkout (iDeal standaard voor NL)
10. Webhook van Stripe → order status naar `confirmed`
11. Pusher push naar keuken + bevestigingspagina gast
12. Gast ziet realtime status: bevestigd → in bereiding → klaar

## Upsell-logica (src/lib/upsell.ts)

```typescript
// Input naar Claude Haiku:
// - Huidige bestelling (item namen + categorieën)
// - Tijdstip van bestelling
// - Seizoen / maand
// - Top 5 meest geconverteerde upsells van dit restaurant (uit DB)
// Output: array van 2-3 menu_item IDs om te tonen
```

## HeyGen video-strategie

Pre-rendered video's (geen real-time API-calls tijdens gastbezoek):
- `ochtend.mp4` — 06:00–11:00
- `lunch.mp4` — 11:00–14:00  
- `middag.mp4` — 14:00–17:00
- `avond.mp4` — 17:00–22:00
- `nacht.mp4` — 22:00–06:00

Videos opgeslagen op Vercel Blob per restaurant-slug.
Video-selectie server-side in page.tsx op basis van `new Date()` + timezone.

## Database tabellen (overzicht)

- `restaurants` — tenant-root, bevat branding + instellingen
- `restaurant_members` — koppeling Clerk user → restaurant + rol
- `menu_categories` — categorieën per restaurant (koffie, bier, etc.)
- `menu_items` — items met prijs_cents, allergenen, varianten (jsonb), upsell-koppelingen
- `tables` — tafels met tafelnummer + qr_code_url
- `orders` — bestellingen met status, items (jsonb snapshot), betaalinfo
- `video_scripts` — HeyGen scripts per tijdslot per restaurant

## Wat ik NIET wil

- Geen `console.log` in productie-code (gebruik `pino` logger)
- Geen hardcoded restaurant IDs of tafel IDs
- Geen directe SQL strings — altijd Drizzle query builder
- Geen `.env` values in client components (alleen `NEXT_PUBLIC_` prefix)
- Geen synchrone operations in API routes
- Geen pagina's die de volledige orders-tabel laden zonder pagination
