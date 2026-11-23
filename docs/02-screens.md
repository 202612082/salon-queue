# Screens & Features

## Global UI & Aesthetic Standards
- **Theme:** Dark charcoal background (`#1F2937`), rounded cards (`rounded-xl`), gold accents (`#D4A017`), clean mobile-first responsive layouts across mobile phones, tablets, and TV displays.
- **Bilingual Support:** All UI labels switch cleanly between **English** and **Gujarati**.
- **Top Header (on non-TV screens):** Salon name/logo, open/closed queue indicator, EN/GU language toggle, and a quick navigation bar/drawer so all 7 screens can be tested easily.

## Screen 1: Home (`/`) — Mobile-First
- **Purpose:** Entry screen where customers check live salon wait status and start joining the queue.
- **Elements:**
  - Salon name/logo + Open/Closed badge.
  - Live queue summary card: customers currently waiting and estimated waiting time.
  - Barber status chips showing each barber's current availability (`Available` / `Busy` / `On Break`).
  - Primary gold CTA button: **[ Join Queue ]** (disabled with a clear message if the queue is closed).
- **Empty State:** Friendly message when nobody is waiting (e.g., `"No one waiting — walk right in!"`).

## Screen 2: Join Queue (`/join`) — Mobile-First
- **Purpose:** Allows customers to join the queue from their mobile phone by entering details and choosing services and a barber.
- **Elements:**
  - Customer details inputs: Name (required) and 10-digit Phone Number (validated).
  - Multi-select Service Cards (up to 3 services): displays service name (EN/GU), duration (minutes), and price (`₹`).
  - Barber Selection: choose a specific barber or **"Any Barber (Fastest)"**.
  - Live summary strip: shows selected service count, total duration, total price (`₹`), and estimated waiting time.
  - Submit button: **[ Confirm & Join Queue ]** -> assigns a token and opens `/status/:id`.

## Screen 3: My Status (`/status/:id`) — Mobile-First
- **Purpose:** Lets a customer track their live turn from their mobile phone.
- **Elements:**
  - Large token number (e.g., `S-14`), customer name, selected services, and barber selection.
  - Current queue position (e.g., `"4th in line"`) and live-updating estimated waiting time.
  - Alert banner when 2nd in line (`"Start coming to the salon"`).
  - High-visibility gold alert when status becomes `Called` (`"It's your turn! Please go to [Barber Name]"`).
  - **[ Cancel My Spot ]** button with a confirmation prompt.

## Screen 4: Reception Dashboard (`/reception`) — Tablet & Desktop
- **Purpose:** Enables the receptionist to manage the waiting list, add walk-ins, and call customers.
- **Elements:**
  - Top bar action: **[ + Add Walk-In ]** opening a quick form (Name, Phone, Services, Preferred Barber).
  - Barber cards: show current customer, service progress/time left, and **[ Call Next ]** button.
  - Waiting list in queue order: token, customer name, services, preferred barber, waiting time (highlighting long waits), **[ No-Show ]**, and **[ Cancel ]** actions.

## Screen 5: Barber View (`/barber/:name`) — Mobile & Tablet
- **Purpose:** Enables a barber to view assigned customers, control service stages, and update availability.
- **Elements:**
  - Availability toggle (`Available` / `On Break`) and quick barber selector if testing multiple barbers.
  - Current customer card: token, customer name, services, timer, **[ Start Service ]** button (`Called` -> `In Chair`), and **[ Complete Service ]** button (`In Chair` -> `Done`).
  - Next eligible customer preview for that barber.

## Screen 6: Waiting Area Display (`/display`) — TV Display
- **Purpose:** Large, high-contrast screen for the salon waiting area.
- **Elements:**
  - Currently served customers per barber (barber name + active token).
  - Next **5** waiting queue tokens with estimated wait times.
  - Highlight/flash effect when a new token is called.

## Screen 7: Owner Settings (`/admin`) — Tablet & Desktop
- **Purpose:** Allows the salon owner/admin to manage services, prices, staff availability, queue settings, and daily statistics.
- **Elements:**
  - Daily statistics cards: customers served today, current waiting count, average wait time, and no-shows.
  - Queue availability toggle (`Open` / `Closed` for online joining).
  - Barber duty toggles (which barbers are on duty today).
  - Services & pricing manager: add/edit/toggle services with English name, Gujarati name, duration, and price (`₹`).