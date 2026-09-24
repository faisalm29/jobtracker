Viewed applications-schema.ts:1-150
Ran command: `dir /s /b *constants*`
Ran command: `Get-ChildItem -Recurse -Filter "*constant*"`
Ran command: `Get-ChildItem packages`
Ran command: `Get-ChildItem packages/constants/src`
Viewed applications.ts:1-55
Ran command: `Get-ChildItem apps/api/src/db/schema`
Ran command: `Get-ChildItem -Recurse apps/api/src/routes`
Viewed applications.index.ts:1-23
Ran command: `Get-ChildItem apps`
Ran command: `Get-ChildItem -Recurse apps/web/src`
Viewed applications.routes.ts:1-60
Viewed index.ts:1-12

Based on your database schema and the data you're already capturing in [`applications-schema.ts`](file:///c:/Development/Web/jobtracker/apps/api/src/db/schema/applications-schema.ts) and [`@jobtracker/constants`](file:///c:/Development/Web/jobtracker/packages/constants/src/applications.ts), here is a recommended set of metrics and insights for your dashboard, grouped by purpose:

---

### 1. High-Level KPI Summary Cards (The "At a Glance" Row)

These cards sit right at the top of the dashboard to give an instant pulse check:

- **Total Applications**: Total active applications submitted (`deletedAt IS NULL`).
- **Active Pipeline**: Count of applications currently in progress (`status IN ('applied', 'in_progress')`).
- **Interviews / Stages Scheduled**: Number of active or upcoming stages (`status = 'scheduled'`).
- **Offers Received**: Count of applications with status `'offered'` or `'accepted'`.
- **Response / Conversion Rate**:
  $$\text{Response Rate} = \frac{\text{Applications that reached } \texttt{in\_progress} \text{ or beyond}}{\text{Total Applied}} \times 100\%$$
  $$\text{Offer Rate} = \frac{\text{Offered}}{\text{Total Applied}} \times 100\%$$

---

### 2. Actionable & Time-Sensitive Items (Immediate Attention)

A dashboard should not only show historical metrics, but tell the user what to do today:

- **Upcoming Interviews & Deadlines**:
  - Upcoming stages where `status = 'scheduled'` and `scheduledAt >= CURRENT_TIMESTAMP`, ordered by date ascending.
  - Saved jobs where `deadline` is approaching (e.g., within the next 3–7 days).
- **Needs Follow-Up / Stale Tracker**:
  - Applications in `'applied'` or `'in_progress'` where `statusChangedAt` or `updatedAt` is older than 14–21 days (candidates can follow up or mark as `'ghosted'`).

---

### 3. Visual Analytics & Funnels (Charts)

- **Pipeline Funnel / Status Breakdown** _(Donut or Stacked Bar Chart)_:
  - Count by `status` (`saved`, `applied`, `in_progress`, `offered`, `accepted`, `rejected`, `withdrawn`, `ghosted`).
- **Application Velocity Over Time** _(Line or Bar Chart)_:
  - Number of applications submitted (`appliedDate`) grouped by week or month (e.g., past 4, 8, or 12 weeks).
  - Helps job seekers track and maintain their job-hunting consistency.
- **Stage Drop-Off / Interview Funnel**:
  - Using `applicationsStages.type` (`screening`, `skills_test`, `technical_skills`, `behavioral`, `presentation`, `final_round`), see where applications advance vs. stall.
- **Source Performance** _(Bar Chart)_:
  - Total vs. In-Progress applications by `sourceCategory` (`job_board`, `company_website`, `referral`, `recruiter_outreach`).
  - Shows which channels actually yield interviews (e.g. referrals vs cold applying).
- **Workplace & Job Type Breakdown**:
  - Distribution by `workplaceType` (`remote`, `hybrid`, `onsite`) and `jobType` (`full_time`, `contract`, etc.).

---

### 4. Compensation Insights (Optional / Value-Add)

Since you store `salary` and `currency`:

- **Target vs Offered Salary Range**:
  - Average/median target salary across applied roles vs offers received (grouped by `currency`).

---

### 5. Recommended API Route Structure

Rather than making one monolithic endpoint or 10 separate tiny calls, a clean pattern with Hono & OpenAPI is:

| Method | Endpoint                     | Purpose                                                                    |
| :----- | :--------------------------- | :------------------------------------------------------------------------- |
| `GET`  | `/dashboard/stats`           | KPI summary counters + status & source distributions                       |
| `GET`  | `/dashboard/upcoming`        | Next 5–10 scheduled interview stages & approaching deadlines               |
| `GET`  | `/dashboard/timeline`        | Weekly/monthly application velocity over a date range query (`?from=&to=`) |
| `GET`  | `/dashboard/recent-activity` | Latest status changes using `applicationStatusHistory`                     |

---

Would you like to start with a unified `/dashboard/stats` route (KPIs + status breakdowns), or implement the routes split by focus area?
