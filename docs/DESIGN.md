# Rem design system

Rem mixes the three explored directions (see the design canvas), each where it works best:

| Layer | From | Used for |
|---|---|---|
| **Base** | Calm | Every screen: layout, type, buttons, forms, statuses, settings, money |
| **Celebration** | Confetti | Only celebration moments: the next-moment card, milestone badges, empty-state dots, later "sent" states and e-cards |
| **Personal voice** | Keepsake | Only personal words: names on celebration cards and, later, message drafts, e-cards and the "Ask them" page |

Rule of thumb: if it is about trust (what happens, when, what it costs), use Calm. If it is about the
person or the moment, Confetti colour or the Keepsake serif may appear, but never both on every screen.

## Tokens (`apps/web/app/globals.css`)

| Token | Light | Use |
|---|---|---|
| `ground` | `#F5F6F2` | Page background |
| `card` | `#FFFFFF` | Cards, lists, forms |
| `ink` / `body` / `muted` | `#17201C` / `#39443F` / `#56625C` | Headings / text / secondary text (all ≥ 4.5:1 on ground and card) |
| `pine` (+ `on-pine`) | `#1F4D3F` | Primary actions, active nav, "strong" tiles |
| `*-tint` / `*-ink` pairs | pine, apricot, sky, coral, sun | Status pills and avatars (pairs are contrast-checked) |
| `coral`, `sunflower`, `lilac`, `party-ink`, `party-paper` | Confetti | Celebration surfaces only; fixed in both themes |

Dark mode redefines the neutral, pine and tint tokens under `prefers-color-scheme: dark`; celebration
colours stay the same.

## Type
- **Plus Jakarta Sans** (`font-sans`): everything by default. Headings 800, labels 600-700.
- **Fraunces** (`font-serif`): personal words only; italics for warmth ("Ada · *turns 30*").

## Components
- Rounded corners: 12 px controls, 16 px cards, 24 px celebration cards. Soft shadow (`shadow-sm`), no borders on cards.
- Buttons: 48 px high primary (`bg-pine`), 44 px minimum touch targets everywhere.
- Status pills: `Milestone` (coral tint), within 7 days (apricot tint), later (sky tint), handled/autopilot (pine tint).
- Icons: 2 px rounded strokes (`components/icons.tsx`), never emoji in the interface.
- Navigation: sidebar from `md`, bottom tab bar on phones.
