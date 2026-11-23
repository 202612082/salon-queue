# AGENTS.md — Salon Queue Management System

Web-based Salon Queue Management System with mobile customer screens, reception dashboard, barber view, TV waiting display, and owner admin panel in English and Gujarati.

## Read First
- `docs/01-brief.md` — Project overview, problem, users, must-have features, out-of-scope features, and look & feel.
- `docs/03-flows-rules.md` — User flows, status transitions, queue/barber rules, sync behavior, and test checklist.

## Stack & Run Command
- React + Vite + Tailwind CSS + React Router.
- Start dev server with `npm run dev`.
- Use `localStorage` with `storage` event listeners (and brief polling fallback) as a lightweight shared state store so separate browser tabs/windows stay in sync without needing a backend server. Include realistic pre-seeded salon data and a reset option in `/admin`.

## Working Rules
- Implement only what is asked in the current prompt; do not alter unrelated screens unless requested.
- Keep the `#1F2937` charcoal background, `#D4A017` gold accents, rounded cards, and mobile-first responsive design.
- Route UI labels through a centralized English/Gujarati dictionary rather than hardcoding text inline.
- Keep queue rules and calculations centralized in one utility module.
- Do not add out-of-scope features (no payments, future bookings, SMS/WhatsApp, loyalty programs, or multi-branch management)