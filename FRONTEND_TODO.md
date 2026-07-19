# Frontend TODO / Known Gaps

This build completed the **core scope**: project setup, auth/session
management, the application shell, the role-based dashboard, and full
Patients + Appointments modules. Everything else is scaffolded as a
"Coming Soon" stub page with its own API client module already written and
typed in `lib/api/`, ready to wire up.

## Fully working (real backend data, real mutations)

- Login / logout, idle-session timeout (25 min warning, 30 min forced logout)
- Role-based dashboard (all 7 roles: ADMIN, DOCTOR, NURSE, RECEPTIONIST,
  LAB_TECH, PHARMACIST, ACCOUNTANT)
- Patients: list, search, register, edit, detail page with Overview,
  Appointments, Medical History (create + timeline), Lab Tests (read-only),
  Documents (link/remove via URL), Billing (read-only)
- Appointments: doctor/date selection, day-grid slot view, booking, status
  transitions (Confirm/Check In/Complete/Cancel/No-show), reschedule
- Doctors: directory table, two-step "Add Doctor" (select an existing
  DOCTOR-role user or create one inline via the shared `UserPicker`, then
  the clinical profile), edit, weekly schedule management (add/toggle
  availability/remove blocks, with overlap validation surfaced from the
  backend's 409 responses)
- Laboratory: status-tabbed queue (Ordered/Sample Collected/In
  Progress/Completed), "+ New Test Request", inline status-transition
  buttons, "Enter Result" dialog, print-friendly report view (gated on
  COMPLETED status per the backend rule)
- Pharmacy: inventory table with All/Low Stock/Expiring Soon tabs, add/edit,
  dispense dialog (surfaces insufficient-stock 409s), delete
- Billing Hub: status-tabbed invoice ledger, the full multi-step "New
  Invoice" flow (open draft → add itemized charges live → compile → record
  a payment inline), invoice detail sheet (line items, payment history,
  record payment, cancel), print-friendly receipt view

## Stubbed — needs follow-up work

1. **Staff module** (`/staff`) — employee directory, attendance log +
   clock-in/out widget, leave records with approve/reject.
   `lib/api/staff.ts` (employeesApi, attendanceApi, leaveApi) is ready.
2. **Reports module** (`/reports`) — the 6 report endpoints are wired in
   `lib/api/reports.ts`; needs date-range pickers + charts. `recharts` is
   now installed (added while building Billing) but not yet used anywhere.
3. **Admin Settings** (`/admin`) — Roles CRUD and Departments CRUD.
   `lib/api/roles.ts` and `lib/api/departments.ts` are ready, and
   `lib/hooks/use-reference-data.ts` already has full create/update/delete
   mutations for both — the page just needs a table + dialog UI wired to
   them (same pattern as the Doctors/Pharmacy pages).

## Known architectural gaps / decisions to revisit

- **No `ACCOUNTANT` role exists in the backend seed data.** The nav config
  and dashboard already handle it (`lib/constants.ts` → `ROLES.ACCOUNTANT`,
  `lib/nav-items.ts`), but you'll need to `POST /api/v1/roles` to actually
  create it and assign a user to it before an Accountant can log in. Until
  then, gate Billing/Reports access via ADMIN.
- **No file upload endpoint.** `PatientDocumentRequestDTO.fileUrl` is just a
  string — the "Link Document" dialog expects a URL you paste in, not an
  actual file picker. Add a Next.js Route Handler (`app/api/upload/route.ts`)
  backed by real object storage (S3, Supabase Storage, etc.) and wire the
  Documents tab to it if real uploads are needed.
- **Token cookie is not httpOnly.** Because this app calls the Spring Boot
  API directly from the browser (no Next.js backend proxy), the session
  token must be readable by client JS to attach the `Authorization` header —
  see the comment in `app/api/session/route.ts`. If you later add a proxy
  layer (all `/api/v1/*` calls routed through Next.js Route Handlers instead
  of straight to the Spring backend), move the token to a true httpOnly
  cookie and have the proxy attach it server-side.
- **No backend authorization enforcement.** The Spring backend doesn't
  currently have a request-level auth filter — role checks in this frontend
  (nav filtering, dashboard cards) are a UX layer only, not a security
  boundary. Don't rely on this app alone to keep e.g. a RECEPTIONIST out of
  billing data at the API level.
- **Notifications popover** fetches low-stock/overdue/pending-leave lists
  directly (no dedicated notifications endpoint exists) and is gated by
  role client-side only, per the point above.
- **No calendar/date-picker popover component.** `react-day-picker` v10 was
  installed but its API differs enough from the classic shadcn `Calendar`
  recipe that wiring it up reliably was out of scope for this pass — all
  date inputs currently use styled native `<input type="date">` /
  `type="time">`. Swap in a richer calendar component later if desired.
- **Doctor identity nuance:** `Appointment.doctorId` and
  `MedicalRecord.doctorId` refer to the **User** id, not the `Doctor` profile
  id (`Doctor.id`) — the backend models it this way (Appointment/MedicalRecord
  reference `User` directly). `DoctorResponseDTO.userId` is what you want
  when linking a Doctor directory row to their appointments/records.

## Not implemented at all (out of scope for this pass)

- Print-to-PDF for invoices/receipts
- Recharts-based visualizations on Reports
- Full accessibility audit (basics like labeled inputs and focus trapping
  are in place via the form/dialog primitives, but no formal audit was run)
