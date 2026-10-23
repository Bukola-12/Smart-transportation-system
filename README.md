# CampusGo — Smart Campus Transportation Management System
### OAU SWEP Project • Responsive Web Application

CampusGo is a comprehensive, production-ready web application designed to eliminate uncertainty around campus transportation availability and modernize tricycle charter coordination across Obafemi Awolowo University (OAU) Campus Gate Car Park and SUB Car Park.

Built strictly in accordance with the SWEP **Software Requirements Specification (SRS)** and the official UI design specifications.

---

## 🌟 Key Capabilities & SRS Compliance

### 1. Authentication & Role-Based Permissions (FR-01 – FR-04)
- **Supabase Auth Integration**: Integrated with `https://igrgmnjtmjmtzhdurbdp.supabase.co`.
- **4 Distinct Roles**:
  - **Student**: View confirmed bus availability, last-updated timestamps, submit tricycle charter requests, track live trip progress.
  - **Driver**: Check-in/check-out for shifts, update operational status (`Available`, `On trip`, `On break`), manage vehicle location, accept/reject charter requests, progress trips.
  - **Park Administrator**: Manage operations at Campus Gate Car Park or SUB Car Park, record check-ins on behalf of drivers without smartphone/internet access (FR-05), review stale statuses.
  - **Central Administrator**: System-wide oversight across both parks, shared driver and vehicle pools, bookings audit, activity logs, admin permissions management, shift closing.
- **Image Uploading & High-Ratio Client-Side Compression**:
  - Automatically downscales and compresses photos (5MB - 15MB phone photos compressed down to ~80KB - 160KB, **>97% size reduction**) before upload or local storage.
  - Bilinear canvas downscaling with visual compression badges (`⚡ 4.8 MB → 110 KB (-97%)`).
  - Protects mobile data, reduces upload latency to milliseconds, and avoids storage limits.
- **Bolt App UI & Design Language Across All Ends**:
  - **Electric Bolt Green Palette**: `#00C269` / `#34D186` vibrant accents with obsidian dark mode (`#0D1017`) and crisp light mode cards.
  - **Bolt Route Connector**: Vertical connector from green pickup dot to dark destination square with quick-select campus spot shortcuts.
  - **Bolt Ride Tier Cards**: Standard, Direct Comfort, and Preferred Driver tiers with wait times and vehicle icons.
  - **Bolt Driver Console**: Tactile status buttons (`Available`, `On trip`, `On break`), online duty toggle, incoming ride request cards with passenger landmarks, and instant accept/reject buttons.
  - **Bolt Hero "Where To?" Card**: Search trigger on Student Home for 1-tap charter requests.
- **Central Admin Mobile Collapsible Sidebar**:
  - Replaces static top navigation with a sleek, space-saving sticky mobile header featuring a hamburger menu button.
  - Full-screen slide-over drawer with backdrop blur, system authority badge, navigation links with icons & pending approval counts, theme switcher, and sign-out.
- **Responsive Viewport Architecture**:
  - **Mobile View (`< 768px`)**: Follows the mobile UI mockups down to the pixel with bottom navigation bar, touch-first cards, and streamlined mobile headers.
  - **Laptop & Tablet View (`768px - 1279px`)**: Automatically expands to multi-column cards, wide dashboard layouts, and a dedicated top navigation bar.
  - **Desktop / Wide View (`>= 1280px`)**: Expansive multi-column layouts for high productivity with sidebar layouts for Central Admin and wide card grids for Student, Driver, and Park Admin.
- **High-Contrast Dark View Option**:
  - Carefully calibrated dark color palette (`#0D1017` deep background, `#151821` / `#1E2330` elevated cards, high-contrast crisp text, neon emerald accents).
  - Toggled directly in **every Profile screen** (`Light` / `Dark` buttons matching Pages 11–14 of the mockups), as well as via 1-click Sun/Moon buttons in the top navigation bar and floating switcher.
  - Persisted automatically to `localStorage` and respects system preferences.
- **Modern Bottom Toast Notification System**:
  - Replaced browser `alert()` popups with animated bottom pill notifications (`success`, `error`, `warning`, `info`) that smoothly fade away.
- **Production Deployment Code-Splitting Optimization**:
  - Role-based `React.lazy()` chunking and granular manual chunking in Vite.
  - Initial bundle dropped from 805 kB down to 56 kB (gzip: 15 kB) for lightning-fast loads.

### 2. Driver Shift & Operational Status (FR-05 – FR-13)
- **Separate Shift vs. Operational Status**: Distinguishes whether a driver is on duty from their current operational status.
- **Status Freshness Rule (FR-09, FR-13)**: Statuses stale after 2 hours without update are automatically flagged as `Unconfirmed`. Driver shift does **not** automatically end solely due to the 2-hour window.
- **Shift Closing Workflow (FR-11, FR-12)**: Daily shift closure (configured at 9:00 PM). At closing, uncompleted trips are **not** falsely marked completed; they are flagged as `Needs review` for administrative audit.

### 3. Shared Fleet & Park Management (FR-14 – FR-19)
- **Shared Pool across Parks**: One unified pool of drivers and vehicles across Campus Gate Car Park and SUB Car Park.
- **En Route Separation**: Vehicles en route between parks are never counted as available at their departure park. Moving between parks preserves the same persistent driver and vehicle records without duplication.

### 4. Student Availability View (FR-20 – FR-24)
- **Confirmed Availability**: Shows real-time bus counts at Campus Gate and SUB with last-confirmed timestamps (e.g. `Confirmed 4 min ago`, `Last confirmed 2 h 10 min ago`).
- **Clear Disclaimers**: Clarifies that availability comes from park updates (not live GPS) and that ticket sales continue through the existing university arrangement.

### 5. Tricycle Chartering (FR-25 – FR-32)
- **Booking Lifecycle**: `Pending` → `Accepted` → `In progress` → `Completed` / `Cancelled` / `Rejected`.
- **Conflicting Overlapping Booking Prevention (FR-30)**: Validates that a driver who is already on an active trip cannot accept a second conflicting trip concurrently.
- **Student Live Tracker**: Real-time progress tracker with visual step indicators matching the UI mockups.

### 6. Administration, Disciplinary System & Audit Trail (FR-33 – FR-36)
- **Account Registration & Verification Workflow**:
  - **Students**: Instantly activated upon account creation.
  - **Drivers**: Created in `Pending approval` status until verified and enrolled to a vehicle by a Park Admin or Central Admin.
  - **Park Admins**: Created in `Pending approval` status until explicitly reviewed, assigned a park scope, and verified by the Central Admin.
- **Charter Acceptance On Behalf of Drivers**:
  - Park Admins and Central Admins can accept pending charter requests on behalf of drivers who are currently on shift (`On duty`).
  - Automatically transitions driver status to `On trip`.
  - Prominently displays *who* accepted the booking (e.g. `Folake T. (Park Admin on behalf of Sade I.)` vs. driver directly).
  - Provides a 1-click `Call Driver (tel:...)` notification button to inform the driver immediately.
- **Preferred Driver Selection**:
  - Students requesting a charter can optionally pick a specific on-duty driver from a dropdown list or select fastest general dispatch.
  - Preferred driver requests are visually highlighted on driver dashboards ("★ Requested specifically for YOU!").
- **Tiered Disciplinary Management System**:
  - **Park Administrator Authority**:
    - Can inspect students and drivers.
    - Can issue official warnings with written reasons.
    - Can temporarily suspend accounts from core transport functionalities (requesting charters, driver check-in & trip acceptance) with a **strict maximum cap of 1 month (30 days)**.
  - **Central Administrator Authority**:
    - Can inspect students, drivers, and park admins.
    - Can issue official warnings with written reasons.
    - Can suspend accounts with **no duration ceiling** (custom duration or indefinite).
    - Can indefinitely **deactivate accounts** until manually reactivated.
    - Holds **exclusive authority to permanently delete** student and driver accounts.
- **Core Functionality Restrictions during Suspension**:
  - Suspended students are blocked from submitting tricycle charter requests (prominent red alert banner with suspension reason, issuing admin, and end date).
  - Suspended drivers are blocked from checking into shifts and accepting charter requests.
  - Expired suspensions are automatically lifted upon expiry.
- **Activity Log Audit**: Comprehensive logging for every status change, location change, booking action, and correction with timestamp, actor name, and method.
- **CSV Data Export**: 1-click export of activity logs and bookings to standard CSV files.

---

## 🎨 UI Implementation Reference

Every single screen from the provided UI mockups has been faithfully implemented:

| Screen # | Mockup Reference | Description |
|:---|:---|:---|
| **Page 1 & 15** | `LoginView` | Sign in with email or matric number, quick demo account selector, create account button |
| **Page 2 & 16** | `StudentHome` | "Where is the next bus?", Campus Gate Car Park (3 buses), SUB Car Park (1 bus, Unconfirmed), En route card, Disclaimer |
| **Page 3 & 17** | `TricycleCharterRequest` | "Request a tricycle", pickup, destination with quick campus chips, when options (Now, In 15 min, Custom), fare agreement disclaimer |
| **Page 4 & 18** | `CharterStatusView` | "Waiting for a driver", trip details, 4-step progress tracker, cancel request |
| **Page 5 & 19** | `DriverShiftView` | Dark "ON DUTY Since 8:05 AM" card, Available/On trip/On break selector, Confirm now, Vehicle location chips, New charter request card with Reject & Accept |
| **Page 6 & 20** | `ParkAdminDashboard` | Park header (Campus Gate/SUB), 4 metric cards (Available, On trip, Break, Stale), 1 status needs confirming alert, drivers at park list, "Check in a driver" button |
| **Page 7 & 21** | `CentralAdminOverview` | Left navigation sidebar, 4 metric cards (12 Drivers on duty, 5 Buses available, 3 Active charters, 2 Need review), Shared pool table, 2 Park cards, Needs review card, Recent activity, Shift closing card |
| **Page 8 / 12** | `CentralAdminActivityLog` | Filter chips (All, Driver status, Vehicle location, Bookings, Corrections), audit table with time, entity, change, changed by, method, CSV export |
| **Page 9 / 13** | `CentralAdminAccounts` | Admin accounts table, Permissions side panel with 5 permission toggle switches, park scope selector, Suspend/Reactivate, Save changes |
| **Page 10 / 11** | `CentralAdminBookings` | Alert banner for trip left open at closing, filter tabs (All, Pending, Accepted, In progress, Completed, Cancelled), Bookings table, Unresolved trip review modal, CSV export |
| **Page 11 / 14** | `CentralAdminProfile` | Central Admin profile, Avatar image upload, Appearance Light/Dark, 3 stat cards, Recent actions |
| **Page 12** | `DriverProfileView` | Mobile profile for Emeka A. (Bus 04), 5 Trips today, 6h On duty, 3 Charters, recent trips, avatar photo upload |
| **Page 13** | `ParkAdminProfile` | Mobile profile for Folake T. (Campus Gate), 14 Updates today, 3 Drivers assisted, 1 Corrections, avatar photo upload |
| **Page 14** | `StudentProfile` | Mobile profile for Adaeze N., 6 Charters, 4 Completed, 1 Cancelled, recent trips, avatar photo upload |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher, v24 recommended)
- npm (v9 or higher)

### Installation & Local Development
```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

### Supabase Cloud Setup (Optional)
The project is pre-configured with the Supabase URL and anonymous key.
To set up database tables in your Supabase project:
1. Open the Supabase Dashboard: `https://supabase.com/dashboard/project/igrgmnjtmjmtzhdurbdp`
2. Navigate to the **SQL Editor**
3. Copy the contents of [`supabase_schema.sql`](./supabase_schema.sql) and execute it.
4. In the **Storage** section, create public buckets named `avatars` and `vehicles`.

---

## 👥 Demo Accounts for SWEP Evaluation

Use the **SWEP Role Simulator** in the top right corner to instantly switch between roles or test accounts:

| Role | Name | Email | Default Assignment |
|:---|:---|:---|:---|
| **Student** | Adaeze N. | `adaeze@university.edu` | Requester |
| **Driver** | Emeka A. | `emeka@university.edu` | Bus 04 (Campus Gate) |
| **Park Admin** | Folake T. | `folake@university.edu` | Campus Gate Car Park |
| **Park Admin** | Samuel D. | `samuel@university.edu` | SUB Car Park |
| **Central Admin** | Central Admin | `centraladmin@university.edu` | System-wide oversight |


