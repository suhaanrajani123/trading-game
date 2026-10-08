# Tradepath frontend

Next.js 14 (App Router) + TypeScript + Tailwind. All money logic lives in the
backend; this app only displays data and sends orders.

```bash
npm install
cp .env.local.example .env.local   # points at http://localhost:8000
npm run dev                        # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build (fails on type errors) |
| `npm run lint` | ESLint (`next/core-web-vitals`) |
| `npm run typecheck` | `tsc --noEmit` |

## Layout

```
app/
  page.tsx              Dashboard: account value, allocation, holdings, movers
  trade/                Stock picker, chart with ranges, order ticket
  activity/             Order history, cancel open orders, reset account
  learn/                50 lessons with progress (?lesson=N deep links)
  exam/  videos/
components/
  AppShell, Sidebar, MobileNav     Navigation (sidebar on desktop, tab bar on mobile)
  AccountProvider                  One shared, auto-refreshing portfolio
  SymbolSearch                     Company/ticker search ("/" to focus)
  StockChart                       lightweight-charts, follows the theme
  OrderTicket                      Market / limit order form
lib/
  api.ts      Typed API client (sends the X-User-ID device header)
  format.ts   Money / percent formatting
  hooks.ts    useResource (fetch + polling + events), useDebounced
```

## Design tokens

Colors are CSS variables in `app/globals.css` (light and dark), exposed to
Tailwind as `paper`, `surface`, `surface2`, `line`, `ink`, `inksoft`, `muted`,
`gain`, `loss`, `marker` and `primary`. Green and red are reserved for price
direction; the yellow `marker` is reserved for learning progress and "you are here".
Fonts are self-hosted via `@fontsource` (Bricolage Grotesque for headings,
IBM Plex Sans for everything else), so builds don't need Google Fonts access.
