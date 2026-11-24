## Step 1 : 

Read AGENTS.md and all files in docs/. Initialize a React + Vite + Tailwind CSS + React Router app in this folder. Set up the dark charcoal (#1F2937) and gold (#D4A017) theme, the EN/GU translation dictionary (src/i18n/translations.js), the centralized queue engine (src/utils/queueEngine.js) with localStorage cross-tab sync and pre-seeded dummy data (Ravi, Amit, Imran + 6 sample customers), and placeholder routes for all 7 screens with a top bar and role switcher. Show your plan first, then wait for my OK before creating files.


OK, proceed with this plan. Create the files, verify npm run build, and stop after Step 1 so we can check the dev server.

## Step 2 : Home , Join Queue & My Status

Read docs/02-screens.md (Screens 1, 2, 3) and docs/03-flows-rules.md. Complete and refine Screen 1 (/), Screen 2 (/join), and Screen 3 (/status/:id) so all required behaviors work end-to-end: 10-digit phone validation, duplicate active phone redirect to existing status, max 3 services selection, live total minutes/price/estimated wait updates, sequential token assignment (S-1, S-2...), "Start coming to the salon" alert when 2nd in line, high-visibility gold "It's your turn!" alert when Called, and Cancel My Spot confirmation modal. Keep all labels in src/i18n/translations.js and do not touch Screens 4-7. Show your plan first, then wait for my OK.


OK, implement this plan for Screens 1, 2, and 3 only, run npm run build to verify, and stop after Step 2.


## Step 3 — Reception & Barber Screens

Read docs/02-screens.md (Screens 4 and 5) and docs/03-flows-rules.md. Complete and refine Screen 4 (/reception) and Screen 5 (/barber/:name) so all required behaviors work end-to-end:
1. Screen 4 (/reception): Walk-in customer registration modal (same rules: 10-digit phone, duplicate active phone check, max 3 services, barber choice, sequential token), live barber station cards (Ravi, Amit, Imran) showing current customer/status and [ Call Next ] button (matching earliest Waiting customer for that barber or Any, and disabling [ Call Next ] while the barber is Busy or On Break), plus the waiting queue list with [ Call ] and [ Cancel ] actions.
2. Screen 5 (/barber/:name): Barber switcher tabs (Ravi, Amit, Imran), station status & [ Take Break / End Break ] toggle, current customer card with [ Start Service ] (Called -> In Chair), [ Complete Service ] (In Chair -> Done, freeing the barber to Available), and [ Mark No-Show ] (Called -> No-Show, freeing the barber), plus an upcoming queue preview for that barber.
Keep all labels in src/i18n/translations.js and do not touch Screens 1-3 or Screens 6-7. Show your plan first, then wait for my OK.


OK, implement this plan for Screens 4 and 5 only, run npm run build to verify, and stop after Step 3.


## Step 4 — TV Display & Owner Admin Screens

Read docs/02-screens.md (Screens 6 and 7) and docs/03-flows-rules.md. Complete and refine Screen 6 (/display) and Screen 7 (/admin) so all required behaviors work end-to-end:
1. Screen 6 (/display): Full-screen high-contrast TV waiting screen with large readable typography, live clock, "Now Serving" section showing each active barber station (Ravi, Amit, Imran) with their current token (Called or In Chair) and status, and "Upcoming Queue (Next 5)" showing the next 5 Waiting tokens with barber preference and estimated wait—updating live across browser tabs without manual refresh.
2. Screen 7 (/admin): Daily summary KPI cards (Total Served Today, Currently Waiting, Average Wait Time, No-Shows, Cancelled), master Queue Open / Closed toggle switch (immediately disabling online join on Screens 1-2 when closed), Barber On-Duty toggles (Ravi, Amit, Imran—preventing assignment when off-duty), editable Service Menu & Pricing (add/edit service name in EN/GU, duration in mins, and price in ₹), and Reset Demo Data button with confirmation modal.
Keep all labels in src/i18n/translations.js and do not break Screens 1-5. Show your plan first, then wait for my OK.

OK, implement this plan for Screens 6 and 7 only, run npm run build to verify, and stop after Step 4.