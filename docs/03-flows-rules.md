# Flows, Rules & Test Checklist

## 1. Main User Flows
### Remote Customer Flow
1. Customer opens Home (`/`) -> clicks **[ Join Queue ]**.
2. On `/join`, enters Name and 10-digit Phone, selects 1–3 services, chooses a specific barber or **"Any Barber (Fastest)"**, and clicks **[ Confirm & Join Queue ]**.
3. System generates a sequential token (`S-1`, `S-2`, ...) and opens `/status/:id`.
4. As customers ahead finish, position and estimated waiting time update automatically; at 2nd in line, the `"Start coming to the salon"` alert appears.
5. Receptionist clicks **[ Call Next ]** for an eligible barber -> token moves to `Called`, customer sees `"It's your turn!"` in gold, and TV display highlights the token.
6. Barber clicks **[ Start Service ]** (`In Chair`) and then **[ Complete Service ]** (`Done`), removing the customer from the active queue and updating daily stats.

### Walk-In Customer Flow
1. Receptionist clicks **[ + Add Walk-In ]** on `/reception`.
2. Enters Name, Phone, Services, and Barber preference -> customer joins the end of the queue in first-come, first-served order.

## 2. Queue Statuses & Transitions
- Allowed forward path: `Waiting` -> `Called` -> `In Chair` -> `Done`.
- Allowed removals: `Waiting` -> `Cancelled` (by customer or receptionist); `Called` -> `No-Show` (by receptionist).
- Statuses never move backward.

## 3. Core Queue Rules
- **First-Come, First-Served:** Customers are ordered by arrival time within `Waiting`.
- **Barber Preference:** Clicking **[ Call Next ]** for Barber `X` picks the earliest `Waiting` customer who chose `X` or `Any`. A customer who chose a specific barber is never assigned to a different barber.
- **Single Active Turn Per Barber:** A barber can handle only one `Called` or `In Chair` customer at a time.
- **One Active Spot Per Phone:** A phone number with an active (`Waiting`, `Called`, `In Chair`) token cannot create a duplicate active spot; it routes to the existing status view.
- **Estimated Waiting Time:** Calculated from the service durations of `Waiting` customers ahead divided by active working barbers (minimum 1).
- **No-Show Re-Entry:** If a `No-Show` customer returns later and is re-added, they receive a new token at the end of the queue.
- **Barber Break & Closed Queue:** Barbers `On Break` cannot be called until available; closing the queue in `/admin` disables new online joins on `/` and `/join`.
- **Cross-Screen Sync:** Changes across `/`, `/join`, `/status/:id`, `/reception`, `/barber/:name`, `/display`, and `/admin` stay synchronized across browser tabs/windows via `localStorage` and storage events.

## 4. Test Checklist
- [ ] Joining with multiple services (up to 3) sums duration and `₹` price accurately.
- [ ] Joining again with an active phone number opens existing status without duplicating.
- [ ] `[ Call Next ]` for a specific barber skips customers waiting for a different barber.
- [ ] Calling a customer updates My Status and TV Display within a few seconds across tabs.
- [ ] Starting and completing a service updates Barber View, Reception, TV Display, and Owner stats.
- [ ] Marking `No-Show` and re-adding places the customer at the back with a new token.
- [ ] Closing the queue in `/admin` blocks new online joins cleanly.
- [ ] Switching language between English and Gujarati updates UI labels cleanly.