# Royal Salon — Queue Management System
### રોયલ સલૂન — ડિજિટલ કતાર મેનેજમેન્ટ સિસ્ટમ

**Live demo:** https://salon-queue-two.vercel.app
**Hosted on:** Vercel (frontend)

A web-based Salon Queue Management System built with **React**, **Vite**, **Tailwind CSS**, and **React Router**. Features mobile customer screens, a reception management dashboard, a barber station view, a high-contrast TV waiting room display, and a salon owner administration panel with complete **English** and **Gujarati** bilingual support.

---

## 🎨 Look & Feel

* **Theme:** Dark charcoal background (`#1F2937`), rounded cards (`rounded-xl`), and elegant gold accents (`#D4A017`).
* **Design Strategy:** Mobile-first responsive layouts across smartphones (375px+), tablets, desktop monitors, and 1080p TV displays.
* **Navigation:** Sticky top navigation bar with a live **Queue Open/Closed** indicator, role/screen switcher pills for all 7 screens, a one-click **EN/GU language toggle**, and a demo data reset action.

---

## ⚡ Key Architectural Features

### 1. Centralized Queue Engine (`src/utils/queueEngine.js`)
* **Single Source of Truth:** Manages the entire lifecycle of queue tokens, barber availability states, catalog services, and daily performance metrics.
* **Status Lifecycle:**
  * **Forward Path (Strictly Forward-Only):** `Waiting` ➔ `Called` ➔ `In Chair` ➔ `Done`
  * **Allowed Removals:** `Waiting` ➔ `Cancelled` (by customer or receptionist); `Called` ➔ `No-Show` (by receptionist or barber).
* **Sequential Token Assignment:** Generates unique sequential tokens (`S-1`, `S-2`, `S-3`, ...).
* **Single Active Spot Per Phone Number:** Prevents duplicate active tokens (`Waiting`, `Called`, `In Chair`) for the same 10-digit mobile number, automatically redirecting returning customers to their active status screen.
* **Barber Matching Rules:**
  * `[ Call Next ]` for Barber *X* selects the earliest `Waiting` customer requesting *X* or *Any*.
  * A customer requesting a specific barber is never assigned to a different barber.
  * Barbers marked **On Break** or **Off Duty** cannot receive customer assignments.
* **Dynamic Wait Time Estimation:** Sum of service durations of all waiting customers ahead divided by active on-duty working barbers (minimum 1).

### 2. Real-Time Cross-Tab Synchronization
* Operates without requiring an external backend server by utilizing `localStorage` as a shared state store combined with:
  1. `window.addEventListener('storage', ...)` for immediate cross-tab/cross-window event propagation.
  2. Local `CustomEvent` dispatching for instantaneous in-tab reactivity.
  3. A 2-second polling fallback to guarantee state consistency across backgrounded or throttled tabs.
* Actions taken in Reception or Barber stations update the Customer mobile view and TV Waiting display in real-time.

### 3. Full Bilingual Support (English & Gujarati)
* All UI strings are routed through a centralized dictionary in [`src/i18n/translations.js`](file:///Users/manya/Documents/DAU/salon-queue/src/i18n/translations.js) with zero inline hardcoded text.
* Managed by [`LanguageContext.jsx`](file:///Users/manya/Documents/DAU/salon-queue/src/i18n/LanguageContext.jsx) with dynamic parameter interpolation (e.g., `{pos}`, `{barber}`, `{token}`, `{count}`).

---

## 📱 All 7 Screens & Routes

| Screen | Route | Target Device | Core Features & Behaviors |
| :--- | :--- | :--- | :--- |
| **Screen 1: Home** | `/` | Mobile-First | Live waiting count & wait time estimate; barber availability chips (Available, Busy, On Break); gold **[ Join Queue ]** CTA; empty queue greeting; returning user active token shortcut banner. |
| **Screen 2: Join Queue** | `/join` | Mobile-First | Full Name input; numeric 10-digit Phone input with live `{count}/10 Digits` badge; multi-select services (1 to 3 services max); barber choice (Any or specific); live dynamic summary strip (total mins, total ₹, estimated wait); duplicate active phone detection & redirect; sequential token assignment. |
| **Screen 3: My Status** | `/status/:id` | Mobile-First | Large token badge (e.g., `S-4`); live line position (`2nd in line`); dynamic wait time; **2nd in line amber arrival alert** (`"Start coming to the salon"`); **Called high-visibility gold glowing alert** (`"IT'S YOUR TURN NOW! Please proceed to [Barber]"` ); In Chair, Done, Cancelled, and No-Show banners; **[ Cancel My Spot ]** confirmation modal. |
| **Screen 4: Reception** | `/reception` | Tablet & Desktop | **[ + Add Walk-In ]** registration modal (10-digit phone validation, duplicate active check, max 3 services, sequential token); barber station cards (Ravi, Amit, Imran) with live status and **[ Call Next ]** button (strictly disabled while busy/break); active waiting queue table with **[ Call ]** and **[ Cancel ]** actions and long-wait warnings (>20m). |
| **Screen 5: Barber View** | `/barber/:name` | Mobile & Tablet | Barber station switcher tabs (Ravi, Amit, Imran); station status & **[ Take Break / End Break ]** toggle; active customer card with elapsed stage timer; **[ Start Service ]** (`Called` ➔ `In Chair`); **[ Complete Service ]** (`In Chair` ➔ `Done`, freeing station to Available); **[ Mark No-Show ]** (`Called` ➔ `No-Show`, freeing station); upcoming queue preview for that station. |
| **Screen 6: TV Display** | `/display` | TV Display / Monitor | Full-screen high-contrast layout; live digital clock & date; **Now Serving** stations with 6xl gold tokens, status badges (`CALLED`, `IN CHAIR`, `READY`), and glowing pulse animations; **Upcoming Queue (Next 5)** with token numbers, names, barber preferences, and wait times; native browser fullscreen toggle button (`⛶ Fullscreen`). |
| **Screen 7: Owner Admin** | `/admin` | Tablet & Desktop | 5 daily summary KPI cards (**Served Today**, **Waiting Now**, **Avg Wait Time**, **No-Shows**, **Cancelled Today**); master **Queue Open / Closed** toggle switch (immediately disables online joins across tabs when closed); **Barber On-Duty** toggles (Ravi, Amit, Imran — prevents customer assignment when off-duty); **Editable Service Menu & Pricing** (add/edit service name in EN/GU, duration, and price in ₹, delete with minimum 1 safeguard); **Reset Demo Data** with confirmation modal. |

---

## 👥 Pre-Seeded Realistic Demo Data

The application comes pre-populated with realistic salon data ready for immediate testing:

### Barbers
* **Ravi** (On Duty: `true`, Status: `Busy`, Serving: `S-2` in chair)
* **Amit** (On Duty: `true`, Status: `Busy`, Called: `S-3`)
* **Imran** (On Duty: `true`, Status: `On Break`, Serving: `null`)

### Sample Customers (6 Representative Lifecycle Stages)
1. **`S-1`** — *Jayesh Patel* (Phone: `9876543210` • Classic Haircut • Barber: Ravi • **Status: Completed / Done**)
2. **`S-2`** — *Mehul Shah* (Phone: `9876543211` • Haircut + Beard Trim • Barber: Ravi • **Status: In Chair**)
3. **`S-3`** — *Hardik Joshi* (Phone: `9876543212` • Classic Haircut • Barber: Amit • **Status: Called**)
4. **`S-4`** — *Pratik Mehta* (Phone: `9876543213` • Head Massage + Haircut • Barber: Any • **Status: Waiting, 1st in line**)
5. **`S-5`** — *Chirag Dave* (Phone: `9876543214` • Beard Trim & Shape • Barber: Imran • **Status: Waiting, 2nd in line — triggers arrival alert**)
6. **`S-6`** — *Ketan Trivedi* (Phone: `9876543215` • Classic Haircut • Barber: Any • **Status: Waiting, 3rd in line**)

### Catalog Services
* **Classic Haircut** (ક્લાસિક હેરકટ) — 25 mins • ₹150
* **Beard Trim & Shape** (દાઢી સેટિંગ અને શેવિંગ) — 15 mins • ₹80
* **Hair Wash & Conditioning** (હેર વોશ અને કંડિશનિંગ) — 15 mins • ₹100
* **Relaxing Head Massage** (રિલેક્સિંગ હેડ મસાજ) — 20 mins • ₹120
* **Express Face Cleanup** (એક્સપ્રેસ ફેસ ક્લીનઅપ) — 30 mins • ₹250
* **Hair Color & Styling** (હેર કલર અને સ્ટાઇલિંગ) — 40 mins • ₹300

---

## 🚀 Getting Started & Local Setup

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)

### Installation
```bash
git clone <repository-url>
cd salon-queue
npm install
```

### Run Development Server
```bash
npm run dev
```
Open **http://localhost:5173/** in your browser.

### Build for Production
```bash
npm run build
```
Builds the optimized production bundle in the `dist/` folder with zero warnings or errors.

---

## 🧪 Multi-Tab Synchronization Testing Walkthrough

To verify real-time cross-tab synchronization without a backend server, open separate browser tabs or windows side-by-side:

1. **Tab 1 — Customer Phone:** Open `http://localhost:5173/status/S-5` (Chirag Dave, 2nd in line).
   - Observe the amber alert: *"Start coming to the salon! You are 2nd in line."*
2. **Tab 2 — TV Display:** Open `http://localhost:5173/display`.
   - Observe Ravi and Amit currently serving in the "Now Serving" column, and Imran on break.
3. **Tab 3 — Reception Dashboard:** Open `http://localhost:5173/reception`.
   - Register a walk-in customer using **[ + Add Walk-In ]** (e.g., Name: *Kishore Kumar*, Phone: `9922334455`, Service: *Beard Trim*, Barber: *Any*).
   - Notice the new token `S-7` immediately appears at the end of the queue in Tab 2 and Tab 3.
4. **Tab 4 — Barber Station:** Open `http://localhost:5173/barber/Amit`.
   - Amit currently has customer `S-3` in `Called` status.
   - Click **[ Start Service ]**: customer status moves to `In Chair`.
   - Observe Tab 2 (TV Display) immediately transition `S-3` from `CALLED` to `IN CHAIR`.
   - Click **[ Complete Service ]**: Amit finishes the service, frees his chair to `Available`, and increments daily served count.
5. **Back to Reception (Tab 3):**
   - Click **[ Call Next ]** for Amit. Amit immediately calls `S-4` (Pratik Mehta).
   - In Tab 1, Chirag Dave (`S-5`) automatically moves to **1st in line** with updated estimated wait time.
6. **Switch Language:** Click the **ગુજરાતી** button in the top bar on any tab; all UI labels update cleanly without breaking state.
7. **Reset Data:** Click **[ Reset Demo Data ]** in the top bar or Owner Admin to restore all demo defaults at any time.

---

## 🛠️ Tech Stack

* **Framework:** React 18
* **Build Tool:** Vite 6
* **Styling:** Tailwind CSS 3
* **Routing:** React Router DOM 6
* **Icons:** Lucide React
* **State & Sync:** React Context API + LocalStorage + Storage Events
