# Project Rules & Standards - STOP & GO Tyre Care

## 1. Production Quality Requirements
- **No Dummy Placeholders**: Every button, input, toggle, search bar, and action must be fully functional.
- **Zero Syntax / Runtime Errors**: Strict type checking and null-safe property accesses (`customer?.mobile || ''`).
- **Offline Reliability**: The app must operate 100% offline without requiring an active internet connection.

## 2. Business Logic & Calculation Integrity
- **Real-Time Billing Engine**:
  - `Subtotal` = Sum of all selected services (Alignment + Balancing + Gram Weights + Fitting + Rotation + Air + Punctures + Camber).
  - `Total Amount` = `Subtotal - Discount`.
  - Math computations must re-evaluate dynamically on every input change.
- **Gram Weight Math**: `Gram Amount` = `Weight (Grams) * Rate per Gram`.
- **Valves & Fitting Math**: `Total Fitting` = `(Fitting Qty * Rate) + (New Valve Qty * Valve Rate)`.

## 3. UI/UX Rules
- Touch-friendly tap targets (minimum 44px x 44px buttons for mobile/tablet usage).
- Instant visual feedback on active selections (active amber border, checked state).
- Responsive layout adapting seamlessly from Android phones (360px) up to 4K desktop screens.
