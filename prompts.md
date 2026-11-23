Step 1 : 

Read AGENTS.md and all files in docs/. Initialize a React + Vite + Tailwind CSS + React Router app in this folder. Set up the dark charcoal (#1F2937) and gold (#D4A017) theme, the EN/GU translation dictionary (src/i18n/translations.js), the centralized queue engine (src/utils/queueEngine.js) with localStorage cross-tab sync and pre-seeded dummy data (Ravi, Amit, Imran + 6 sample customers), and placeholder routes for all 7 screens with a top bar and role switcher. Show your plan first, then wait for my OK before creating files.


OK, proceed with this plan. Create the files, verify npm run build, and stop after Step 1 so we can check the dev server.

Step 2 : 

Read docs/02-screens.md (Screens 1, 2, 3) and docs/03-flows-rules.md. Complete and refine Screen 1 (/), Screen 2 (/join), and Screen 3 (/status/:id) so all required behaviors work end-to-end: 10-digit phone validation, duplicate active phone redirect to existing status, max 3 services selection, live total minutes/price/estimated wait updates, sequential token assignment (S-1, S-2...), "Start coming to the salon" alert when 2nd in line, high-visibility gold "It's your turn!" alert when Called, and Cancel My Spot confirmation modal. Keep all labels in src/i18n/translations.js and do not touch Screens 4-7. Show your plan first, then wait for my OK.


OK, implement this plan for Screens 1, 2, and 3 only, run npm run build to verify, and stop after Step 2.