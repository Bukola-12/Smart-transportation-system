import os
import base64
import subprocess

def get_base64_image(filename):
    path = os.path.join("public_screenshots", filename)
    if os.path.exists(path):
        with open(path, "rb") as f:
            data = base64.b64encode(f.read()).decode("utf-8")
        return f"data:image/png;base64,{data}"
    return ""

img_student = get_base64_image("student_view.png")
img_charter = get_base64_image("student_charter_form.png")
img_driver = get_base64_image("driver_view.png")
img_parkadmin = get_base64_image("park_admin_view.png")
img_centraladmin = get_base64_image("central_admin_view.png")
img_drivers_list = get_base64_image("central_admin_drivers.png")
img_activity = get_base64_image("central_admin_activity.png")

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>CampusGo - Core Functionalities & System Specification</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

  @page {{
    size: A4 portrait;
    margin: 14mm 12mm 14mm 12mm;
  }}

  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}

  body {{
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    background: #ffffff;
    line-height: 1.5;
    font-size: 9.5pt;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }}

  .page-break {{
    page-break-before: always;
  }}

  .no-break {{
    break-inside: avoid;
    page-break-inside: avoid;
  }}

  :root {{
    --primary: #00C269;
    --primary-dark: #009651;
    --primary-light: #E6F9F0;
    --dark: #0F172A;
    --dark-surface: #1E293B;
    --slate: #475569;
    --muted: #64748B;
    --border: #E2E8F0;
    --bg-light: #F8FAFC;
  }}

  .doc-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid var(--border);
    padding-bottom: 6px;
    margin-bottom: 14px;
    font-size: 8pt;
    color: var(--muted);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}

  .doc-footer {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--border);
    padding-top: 6px;
    margin-top: 16px;
    font-size: 8pt;
    color: var(--muted);
  }}

  .cover-page {{
    min-height: 255mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 16mm 8mm 8mm 8mm;
  }}

  .cover-badge {{
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--primary-light);
    color: var(--primary-dark);
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 9pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}

  .cover-title {{
    font-size: 36pt;
    font-weight: 800;
    color: var(--dark);
    line-height: 1.1;
    margin-top: 20px;
    margin-bottom: 12px;
  }}

  .cover-subtitle {{
    font-size: 14pt;
    color: var(--slate);
    font-weight: 500;
    line-height: 1.4;
    margin-bottom: 20px;
    max-width: 90%;
  }}

  .cover-meta-grid {{
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    background: var(--bg-light);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 16px;
    margin-top: 20px;
  }}

  .meta-item {{
    display: flex;
    flex-direction: column;
  }}

  .meta-label {{
    font-size: 7.5pt;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 700;
    letter-spacing: 0.5px;
  }}

  .meta-value {{
    font-size: 9.5pt;
    color: var(--dark);
    font-weight: 600;
    margin-top: 2px;
  }}

  h1 {{
    font-size: 17pt;
    font-weight: 800;
    color: var(--dark);
    margin-bottom: 8px;
    letter-spacing: -0.3px;
  }}

  h2 {{
    font-size: 12pt;
    font-weight: 700;
    color: var(--dark);
    margin-top: 12px;
    margin-bottom: 6px;
    border-left: 4px solid var(--primary);
    padding-left: 8px;
  }}

  p {{
    margin-bottom: 6px;
    color: #334155;
    font-size: 9pt;
  }}

  .badge {{
    display: inline-block;
    padding: 2px 7px;
    border-radius: 6px;
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }}
  .badge-primary {{ background: #DCFCE7; color: #15803D; }}
  .badge-blue {{ background: #DBEAFE; color: #1D4ED8; }}
  .badge-purple {{ background: #F3E8FF; color: #7E22CE; }}
  .badge-amber {{ background: #FEF3C7; color: #B45309; }}
  .badge-red {{ background: #FEE2E2; color: #B91C1C; }}

  .feature-box {{
    background: #ffffff;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 12px;
    margin-bottom: 8px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }}

  .feature-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }}

  .feature-title {{
    font-weight: 700;
    font-size: 9.5pt;
    color: var(--dark);
  }}

  .feature-desc {{
    font-size: 8.5pt;
    color: #475569;
    line-height: 1.4;
  }}

  .screenshot-frame {{
    background: #0F172A;
    border-radius: 10px;
    overflow: hidden;
    margin: 8px 0 12px 0;
    border: 1px solid #1E293B;
    box-shadow: 0 4px 14px rgba(0,0,0,0.08);
  }}

  .frame-bar {{
    background: #1E293B;
    padding: 5px 10px;
    display: flex;
    align-items: center;
    gap: 6px;
  }}

  .dot {{
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }}
  .dot-red {{ background: #EF4444; }}
  .dot-yellow {{ background: #F59E0B; }}
  .dot-green {{ background: #10B981; }}

  .frame-url {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 7pt;
    color: #94A3B8;
    background: #0F172A;
    padding: 2px 10px;
    border-radius: 5px;
    flex-grow: 1;
    margin-left: 6px;
  }}

  .screenshot-img {{
    width: 100%;
    display: block;
    max-height: 125mm;
    object-fit: cover;
    object-position: top;
  }}

  .screenshot-caption {{
    background: #F8FAFC;
    border-top: 1px solid var(--border);
    padding: 5px 10px;
    font-size: 8pt;
    color: var(--muted);
    font-weight: 500;
  }}

  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0 12px 0;
    font-size: 8pt;
  }}

  th, td {{
    padding: 6px 8px;
    text-align: left;
    border: 1px solid var(--border);
  }}

  th {{
    background: var(--bg-light);
    color: var(--dark);
    font-weight: 700;
  }}

  tr:nth-child(even) td {{
    background: #FAFCFE;
  }}

  .diagram-container {{
    background: #F8FAFC;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px;
    margin: 8px 0 12px 0;
    text-align: center;
  }}

  .diagram-title {{
    font-size: 8pt;
    font-weight: 700;
    color: var(--slate);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }}
</style>
</head>
<body>

<!-- ==================== COVER PAGE ==================== -->
<div class="cover-page">
  <div>
    <div class="cover-badge">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#00C269"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
      SWEP Software Engineering Project • Production Release
    </div>
    <div class="cover-title">CampusGo</div>
    <div class="cover-subtitle">Smart Campus Transportation Management System for Obafemi Awolowo University (OAU)</div>
    <p style="font-size: 10pt; color: #334155; line-height: 1.6; max-width: 90%;">
      A high-performance digital coordination platform designed to eliminate commuter uncertainty, provide verified real-time bus availability across campus parks, manage tricycle charters with transparent fare estimation, and deliver multi-tiered administrative governance with automated disciplinary workflows.
    </p>

    <div class="cover-meta-grid">
      <div class="meta-item">
        <span class="meta-label">Live Deployed URL</span>
        <span class="meta-value" style="color: #00C269;"><a href="https://campus-go-7fcb.onrender.com" style="color: #00C269; text-decoration: none;">https://campus-go-7fcb.onrender.com</a></span>
      </div>
      <div class="meta-item">
        <span class="meta-label">GitHub Repository</span>
        <span class="meta-value"><a href="https://github.com/Bukola-12/Smart-transportation-system" style="color: #1e293b; text-decoration: none;">Bukola-12/Smart-transportation-system</a></span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Target Campus</span>
        <span class="meta-value">Obafemi Awolowo University, Ile-Ife (OAU)</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Key Operating Nodes</span>
        <span class="meta-value">Campus Gate Car Park & SUB Car Park</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">User Roles</span>
        <span class="meta-value">Student, Driver, Park Admin, Central Admin</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Specification Version</span>
        <span class="meta-value">Version 1.0 (Live Deployed)</span>
      </div>
    </div>
  </div>

  <div class="doc-footer">
    <span>Department of Computer Science & Engineering • OAU</span>
    <span>Document ID: SWEP-CAMPUSGO-SRS-2026</span>
  </div>
</div>

<!-- ==================== SECTION 1 ==================== -->
<div class="page-break"></div>
<div class="doc-header">
  <span>CampusGo Specification</span>
  <span>1. Executive Summary & Architecture</span>
</div>

<h1>1. Executive Summary & System Scope</h1>
<p>
  Campus transportation across large university campuses such as Obafemi Awolowo University faces systemic challenges: students often do not know whether a bus is loading at Campus Gate or SUB Car Park, when the last vehicle departed, or whether availability records are fresh. Concurrently, tricycle charters have traditionally been coordinated via informal, unverified roadside negotiations.
</p>
<p>
  <strong>CampusGo</strong> bridges this operational gap by introducing a lightweight, real-time coordination layer that complements the university's physical ticket system without requiring expensive GPS hardware.
</p>

<h2>1.1 Core Boundaries & Guarantees</h2>
<div class="feature-box">
  <div class="feature-header">
    <span class="feature-title">Complementary Ticketing Model (FR-23)</span>
    <span class="badge badge-primary">Guaranteed Boundary</span>
  </div>
  <p class="feature-desc">
    CampusGo explicitly serves as an availability and coordination tool. It does <em>not</em> claim to replace physical ticketing booths or collect bus ticket fares. Students are clearly informed that bus tickets continue to be acquired through established park ticket stands.
  </p>
</div>

<div class="feature-box">
  <div class="feature-header">
    <span class="feature-title">Honest Availability & Zero GPS Pretense (FR-24)</span>
    <span class="badge badge-primary">Accuracy Principle</span>
  </div>
  <p class="feature-desc">
    Rather than rendering unreliable, simulated GPS map pins, CampusGo reports honest operational statuses backed by verifiable timestamps and freshness indicators (e.g., "Confirmed 4 mins ago"). Records older than 2 hours are automatically flagged as <strong>Unconfirmed</strong> (FR-09).
  </p>
</div>

<div class="feature-box">
  <div class="feature-header">
    <span class="feature-title">Unified Shared-Fleet Architecture (FR-14)</span>
    <span class="badge badge-blue">Fleet Continuity</span>
  </div>
  <p class="feature-desc">
    Vehicles and drivers belong to a single university-wide fleet pool that moves dynamically between Campus Gate Car Park and SUB Car Park. Moving between parks does not create duplicate driver records or split inventory.
  </p>
</div>

<h2>1.2 System Architecture & Role Topology</h2>
<div class="diagram-container">
  <div class="diagram-title">Figure 1: CampusGo 4-Tier Role & Fleet Distribution Model</div>
  <svg width="580" height="135" viewBox="0 0 580 135" style="max-width: 100%;">
    <rect x="200" y="5" width="180" height="34" rx="6" fill="#0F172A" />
    <text x="290" y="22" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif">Central Administration</text>
    <text x="290" y="33" fill="#94A3B8" font-size="7.5" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif">Supreme Oversight & Policy Override</text>

    <line x1="250" y1="39" x2="135" y2="58" stroke="#94A3B8" stroke-width="1.5" />
    <line x1="330" y1="39" x2="445" y2="58" stroke="#94A3B8" stroke-width="1.5" />

    <rect x="45" y="58" width="180" height="34" rx="6" fill="#1E293B" />
    <text x="135" y="75" fill="#FFFFFF" font-size="9.5" font-weight="bold" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif">Gate Park Admin</text>
    <text x="135" y="86" fill="#38BDF8" font-size="7.5" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif">Campus Gate Dispatch & Proxy</text>

    <rect x="355" y="58" width="180" height="34" rx="6" fill="#1E293B" />
    <text x="445" y="75" fill="#FFFFFF" font-size="9.5" font-weight="bold" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif">SUB Park Admin</text>
    <text x="445" y="86" fill="#38BDF8" font-size="7.5" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif">SUB Terminal Dispatch & Proxy</text>

    <line x1="135" y1="92" x2="225" y2="108" stroke="#00C269" stroke-width="1.5" />
    <line x1="445" y1="92" x2="355" y2="108" stroke="#00C269" stroke-width="1.5" />

    <rect x="170" y="106" width="240" height="26" rx="5" fill="#00C269" />
    <text x="290" y="122" fill="#FFFFFF" font-size="9.5" font-weight="bold" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif">Shared Driver Pool & Commuter Students</text>
  </svg>
</div>

<!-- ==================== SECTION 2: STUDENT PORTAL ==================== -->
<div class="page-break"></div>
<div class="doc-header">
  <span>CampusGo Specification</span>
  <span>2. Student Portal Functionalities</span>
</div>

<h1>2. Student Portal Core Functionalities</h1>
<p>
  The student portal is crafted with a mobile-first, Bolt-inspired design language allowing students to check live availability in seconds and submit on-demand tricycle charter requests with upfront price estimates.
</p>

<h2>2.1 Verified Bus Availability Monitor (FR-20, FR-21, FR-22)</h2>
<ul>
  <li><strong>Dual-Park Live Overview:</strong> Side-by-side availability counters for Campus Gate Car Park and Student Union Building (SUB) Car Park.</li>
  <li><strong>Color-Coded Freshness Badges:</strong> Green (<em>Confirmed &lt; 30 mins ago</em>), Amber (<em>Aging &gt; 1 hour</em>), and Muted (<em>Unconfirmed &gt; 2 hours</em>).</li>
  <li><strong>Fleet State Breakdown:</strong> Live counts of buses currently loading, buses en route between parks, and standby vehicles.</li>
</ul>

<div class="screenshot-frame no-break">
  <div class="frame-bar">
    <span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span>
    <span class="frame-url">https://campus-go-7fcb.onrender.com (Student Home View)</span>
  </div>
  <img src="{img_student}" class="screenshot-img" alt="Student Home View">
  <div class="screenshot-caption">
    <strong>Screenshot 1:</strong> Student Live Bus Availability Interface featuring live park counters, freshness badges, and quick tricycle charter button.
  </div>
</div>

<h2>2.2 Bolt-Inspired Tricycle Chartering Workflow (FR-25 to FR-30)</h2>
<div class="feature-box">
  <div class="feature-header">
    <span class="feature-title">Intelligent Campus Location Selector (FR-25)</span>
    <span class="badge badge-primary">Smart Routing</span>
  </div>
  <p class="feature-desc">
    Includes over 18 pre-configured campus landmarks across academic and residential zones (Senate Building, Spider House, Moremi Hall, PG College, Health Sciences, E.T.F. Hall, Fajuyi, Awolowo Hall).
  </p>
</div>

<div class="feature-box">
  <div class="feature-header">
    <span class="feature-title">Transparent Fare Estimation & Live Status (FR-26, FR-28)</span>
    <span class="badge badge-blue">Fare Predictability</span>
  </div>
  <p class="feature-desc">
    Calculates estimated fare quotes based on standard distance bands (₦300 - ₦600) and displays live lifecycle statuses: <code>Pending</code> &rarr; <code>Accepted</code> &rarr; <code>In Progress</code> &rarr; <code>Completed</code>. Students see driver identity, phone call shortcut, and vehicle registration upon acceptance.
  </p>
</div>

<div class="screenshot-frame no-break">
  <div class="frame-bar">
    <span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span>
    <span class="frame-url">https://campus-go-7fcb.onrender.com (Tricycle Charter Request)</span>
  </div>
  <img src="{img_charter}" class="screenshot-img" alt="Student Charter Request View">
  <div class="screenshot-caption">
    <strong>Screenshot 2:</strong> Tricycle charter booking screen with campus landmark selector, pickup time options, and fare calculator.
  </div>
</div>

<!-- ==================== SECTION 3: DRIVER PORTAL ==================== -->
<div class="page-break"></div>
<div class="doc-header">
  <span>CampusGo Specification</span>
  <span>3. Driver Portal Functionalities</span>
</div>

<h1>3. Driver Portal Core Functionalities</h1>
<p>
  The driver interface provides licensed bus and tricycle operators with a distraction-free operational dashboard to control their shift availability, receive charter dispatches, and log trip progress.
</p>

<h2>3.1 Shift & Operational State Management (FR-05 to FR-09)</h2>
<table>
  <thead>
    <tr>
      <th>Status Field</th>
      <th>Permitted Values</th>
      <th>Operational Implication</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Shift Status</strong> (FR-08)</td>
      <td><span class="badge badge-amber">Not Checked In</span> | <span class="badge badge-primary">On Duty</span> | <span class="badge badge-red">Shift Ended</span></td>
      <td>Tracks daily work shift lifecycle. Driver cannot receive orders until checked in.</td>
    </tr>
    <tr>
      <td><strong>Operational Status</strong> (FR-07)</td>
      <td><span class="badge badge-primary">Available</span> | <span class="badge badge-blue">On Trip</span> | <span class="badge badge-amber">On Break</span> | <span class="badge badge-red">Unconfirmed</span></td>
      <td>Indicates immediate passenger readiness. Taking a break pauses dispatch without ending shift.</td>
    </tr>
    <tr>
      <td><strong>Stale Detection</strong> (FR-09)</td>
      <td>Auto-triggered after 2 hours without update</td>
      <td>Flags driver as unconfirmed to prevent misleading students, without forcefully ending shift.</td>
    </tr>
  </tbody>
</table>

<div class="screenshot-frame no-break">
  <div class="frame-bar">
    <span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span>
    <span class="frame-url">https://campus-go-7fcb.onrender.com (Driver Shift View)</span>
  </div>
  <img src="{img_driver}" class="screenshot-img" alt="Driver Shift View">
  <div class="screenshot-caption">
    <strong>Screenshot 3:</strong> Driver Shift Management dashboard with one-touch shift check-in, operational status toggles, and live incoming requests stream.
  </div>
</div>

<h2>3.2 Real-Time Charter Dispatch Stream (FR-27 to FR-29)</h2>
<ul>
  <li><strong>Incoming Request Cards:</strong> Displays student pickup point, target destination, passenger name, and estimated fare earnings.</li>
  <li><strong>One-Tap Accept / Decline:</strong> Accepting a request locks the booking immediately, preventing double-assignment (FR-28).</li>
  <li><strong>Active Trip Lifecycle:</strong> Prompts driver through sequential steps: <code>Start Trip</code> &rarr; <code>Complete Trip</code>.</li>
  <li><strong>Daily Earnings & Statistics:</strong> Tracks completed trips, shift hours, and revenue collected today (FR-30).</li>
</ul>

<!-- ==================== SECTION 4: PARK ADMIN PORTAL ==================== -->
<div class="page-break"></div>
<div class="doc-header">
  <span>CampusGo Specification</span>
  <span>4. Park Administrator Portal</span>
</div>

<h1>4. Park Administrator Portal Core Functionalities</h1>
<p>
  Park administrators oversee operational execution at their assigned terminal (Campus Gate Car Park or SUB Car Park), dispatch fleet departures, and act as operational proxies for drivers without smart mobile devices.
</p>

<h2>4.1 Terminal Operations & Non-Smart Driver Proxy (FR-05, FR-10, FR-36)</h2>
<div class="feature-box">
  <div class="feature-header">
    <span class="feature-title">"On-Behalf" Driver Management (FR-05)</span>
    <span class="badge badge-primary">Digital Inclusivity</span>
  </div>
  <p class="feature-desc">
    Drivers without smartphones or internet access report physically to the park admin booth. The Park Admin checks them in, logs departures, and updates operational statuses on their behalf. The audit log explicitly attributes these updates as <code>Updated by Admin on behalf of Driver</code> (FR-10).
  </p>
</div>

<div class="feature-box">
  <div class="feature-header">
    <span class="feature-title">Cross-Park Departure & En-Route Marking (FR-15, FR-17)</span>
    <span class="badge badge-blue">Transit Integrity</span>
  </div>
  <p class="feature-desc">
    When a bus departs Campus Gate for SUB, the park admin marks the vehicle as <code>En Route</code>. This removes it from Campus Gate's available inventory without prematurely counting it as arrived at SUB until verified.
  </p>
</div>

<div class="screenshot-frame no-break">
  <div class="frame-bar">
    <span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span>
    <span class="frame-url">https://campus-go-7fcb.onrender.com (Park Admin Dashboard)</span>
  </div>
  <img src="{img_parkadmin}" class="screenshot-img" alt="Park Admin View">
  <div class="screenshot-caption">
    <strong>Screenshot 4:</strong> Park Admin Operations Command with scoped terminal queue metrics, check-in modals, and vehicle movement controls.
  </div>
</div>

<h2>4.2 Disciplinary Actions (Park Admin Tier - FR-31)</h2>
<ul>
  <li><strong>Formal Disciplinary Warnings:</strong> Park Admins can issue formal written warnings with mandatory recorded reasons (e.g. queue jumping, fare disputes).</li>
  <li><strong>Capped 30-Day Suspension Authority:</strong> Park Admins may issue temporary operational suspensions strictly capped at 30 days. Indefinite or permanent suspensions require Central Admin escalation.</li>
</ul>

<!-- ==================== SECTION 5: CENTRAL ADMIN PORTAL ==================== -->
<div class="page-break"></div>
<div class="doc-header">
  <span>CampusGo Specification</span>
  <span>5. Central Administrator Portal</span>
</div>

<h1>5. Central Administrator Portal Core Functionalities</h1>
<p>
  The Central Administrator possesses university-wide authority over all parks, fleet assets, user accounts, and disciplinary policies, backed by an immutable activity audit trail.
</p>

<h2>5.1 Executive Overview & Master Registry (FR-32, FR-33)</h2>
<p>
  Provides high-level KPIs across the entire OAU campus transport network: active on-duty drivers, total fleet operational distribution, daily charter bookings, and unresolved trip alerts.
</p>

<div class="screenshot-frame no-break">
  <div class="frame-bar">
    <span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span>
    <span class="frame-url">https://campus-go-7fcb.onrender.com (Central Admin Overview)</span>
  </div>
  <img src="{img_centraladmin}" class="screenshot-img" alt="Central Admin Overview">
  <div class="screenshot-caption">
    <strong>Screenshot 5:</strong> Central Admin Executive Dashboard with real-time fleet analytics, terminal balances, and quick administrative actions.
  </div>
</div>

<h2>5.2 Fleet & Driver Master Management (FR-14, FR-32)</h2>
<p>
  Central administration manages driver onboarding, verification, vehicle allocation (Buses and Tricycles), and status overrides across both Campus Gate and SUB Car Parks.
</p>

<div class="screenshot-frame no-break">
  <div class="frame-bar">
    <span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span>
    <span class="frame-url">https://campus-go-7fcb.onrender.com (Drivers & Vehicles Master Roster)</span>
  </div>
  <img src="{img_drivers_list}" class="screenshot-img" alt="Central Admin Drivers View">
  <div class="screenshot-caption">
    <strong>Screenshot 6:</strong> Complete driver and vehicle inventory management, credential validation, and vehicle reassignments.
  </div>
</div>

<!-- ==================== SECTION 6: AUDIT & DISCIPLINE ==================== -->
<div class="page-break"></div>
<div class="doc-header">
  <span>CampusGo Specification</span>
  <span>6. Audit Trails & Disciplinary Architecture</span>
</div>

<h1>6. Activity Auditing & Automated Disciplinary Engine</h1>
<p>
  To guarantee accountability, every state transition in CampusGo is logged into an immutable audit trail, while disciplinary penalties are governed by an automated lifecycle engine.
</p>

<h2>6.1 Real-Time Activity Log (FR-10, FR-35, FR-36)</h2>
<p>
  Every driver check-in, status adjustment, departure dispatch, disciplinary penalty, and record correction is captured with UTC timestamp and actor identity.
</p>

<div class="screenshot-frame no-break">
  <div class="frame-bar">
    <span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span>
    <span class="frame-url">https://campus-go-7fcb.onrender.com (Central Admin Activity Log)</span>
  </div>
  <img src="{img_activity}" class="screenshot-img" alt="Central Admin Activity Log">
  <div class="screenshot-caption">
    <strong>Screenshot 7:</strong> Real-time activity log showing granular audit entries for status updates, disciplinary penalties, and record corrections.
  </div>
</div>

<h2>6.2 Disciplinary Authority Matrix & Automated Expiry (FR-31)</h2>
<table>
  <thead>
    <tr>
      <th>Disciplinary Action</th>
      <th>Park Admin Authority</th>
      <th>Central Admin Authority</th>
      <th>Automated Resolution</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Issue Warning</strong></td>
      <td>Yes (Mandatory reason required)</td>
      <td>Yes (Mandatory reason required)</td>
      <td>Permanent record on driver profile</td>
    </tr>
    <tr>
      <td><strong>Temporary Suspension</strong></td>
      <td>Yes (Strictly capped at 1 to 30 days)</td>
      <td>Yes (Any duration)</td>
      <td><strong>Auto-Expiry Engine:</strong> System automatically reinstates driver when suspension date elapses.</td>
    </tr>
    <tr>
      <td><strong>Indefinite Suspension</strong></td>
      <td>No (Authority restricted)</td>
      <td>Yes (Full authority)</td>
      <td>Requires manual reactivation by Central Admin</td>
    </tr>
    <tr>
      <td><strong>Override / Revocation</strong></td>
      <td>Cannot override Central decisions</td>
      <td>Can override or lift any Park Admin penalty</td>
      <td>Immediate restoration of driver access</td>
    </tr>
  </tbody>
</table>

<!-- ==================== SECTION 7: CREDENTIALS & DEPLOYMENT ==================== -->
<div class="page-break"></div>
<div class="doc-header">
  <span>CampusGo Specification</span>
  <span>7. User Accounts & Technical Innovations</span>
</div>

<h1>7. User Accounts & Engineering Innovations</h1>

<h2>7.1 Pre-Configured Demonstration Accounts</h2>
<p>
  All roles can be evaluated on the live production site using the verified credentials below (Password: <code>password123</code>):
</p>

<table>
  <thead>
    <tr>
      <th>Role</th>
      <th>Account Name</th>
      <th>Email Address</th>
      <th>Assigned Scope / Vehicle</th>
      <th>Password</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span class="badge badge-purple">Central Admin</span></td>
      <td>Central Admin</td>
      <td><code>centraladmin@university.edu</code></td>
      <td>All Parks Oversight</td>
      <td><code>password123</code></td>
    </tr>
    <tr>
      <td><span class="badge badge-blue">Park Admin</span></td>
      <td>Folake T.</td>
      <td><code>folake@university.edu</code></td>
      <td>Campus Gate Car Park</td>
      <td><code>password123</code></td>
    </tr>
    <tr>
      <td><span class="badge badge-blue">Park Admin</span></td>
      <td>Samuel D.</td>
      <td><code>samuel@university.edu</code></td>
      <td>SUB Car Park</td>
      <td><code>password123</code></td>
    </tr>
    <tr>
      <td><span class="badge badge-primary">Bus Driver</span></td>
      <td>Emeka A.</td>
      <td><code>emeka@university.edu</code></td>
      <td>Bus 04 (On Duty)</td>
      <td><code>password123</code></td>
    </tr>
    <tr>
      <td><span class="badge badge-primary">Tricycle Driver</span></td>
      <td>Sade I.</td>
      <td><code>sade@university.edu</code></td>
      <td>Tricycle 02 (On Duty)</td>
      <td><code>password123</code></td>
    </tr>
    <tr>
      <td><span class="badge badge-amber">Student</span></td>
      <td>Adaeze N.</td>
      <td><code>adaeze@university.edu</code></td>
      <td>Matric: CSC/2021/042</td>
      <td><code>password123</code></td>
    </tr>
    <tr>
      <td><span class="badge badge-red">Suspended Student</span></td>
      <td>Ibrahim M.</td>
      <td><code>ibrahim.m@university.edu</code></td>
      <td>Matric: ECN/2021/019 (Suspended 14d)</td>
      <td><code>password123</code></td>
    </tr>
  </tbody>
</table>

<h2>7.2 Technical Optimizations & Architecture</h2>
<div class="feature-box">
  <div class="feature-header">
    <span class="feature-title">Client-Side Image Compression (&gt;97% Reduction)</span>
    <span class="badge badge-primary">Performance</span>
  </div>
  <p class="feature-desc">
    Implemented custom HTML5 Canvas image pre-processing (<code>src/lib/imageCompression.ts</code>) that automatically scales avatars to max 800px and 75% quality before upload. Reduces typical 5MB mobile photos to under 70KB, dramatically reducing mobile data usage on campus cellular networks.
  </p>
</div>

<div class="feature-box">
  <div class="feature-header">
    <span class="feature-title">Non-Blocking Toast Notification System</span>
    <span class="badge badge-blue">Modern UX</span>
  </div>
  <p class="feature-desc">
    Replaced intrusive native browser <code>alert()</code> popups with custom, animated, non-blocking toast notifications positioned at the bottom of the screen with smooth fade-out animations.
  </p>
</div>

<div class="feature-box">
  <div class="feature-header">
    <span class="feature-title">Zero-Auto-Login Session Security</span>
    <span class="badge badge-purple">Security</span>
  </div>
  <p class="feature-desc">
    New visitors land directly on the clean Sign In / Sign Up portal without defaulting into any user profile. Sessions persist in <code>localStorage</code> only while active, and logging out completely clears session tokens, requiring full re-authentication to enter the application.
  </p>
</div>

<div class="doc-footer">
  <span>CampusGo Project Report • Obafemi Awolowo University</span>
  <span>Page 7 of 7 • October 2026</span>
</div>

</body>
</html>
"""

html_path = "campusgo_features_doc.html"
with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Generated HTML report: {html_path} ({round(os.path.getsize(html_path)/1024, 1)} KB)")
