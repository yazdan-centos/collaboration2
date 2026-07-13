# مانیتورینگ تسک‌ها — React Port

React/JSX port of the uploaded `index.html` task-monitoring dashboard. Markup, class names, and CSS are preserved 1:1 from the original so the rendered output is visually identical; all vanilla-JS DOM manipulation was converted to React state/props.

## Component hierarchy

```
index.js
└── BrowserRouter
    └── App
        ├── BackgroundGlow            (decorative fixed-position glow circles)
        ├── Sidebar                   (nav links + user card)
        │     — reads navSections from data/dashboardData.js
        │     — each item is a react-router NavLink to its own path
        └── main.main-content
            ├── TopHeader             (route-driven title/breadcrumb, search box, header buttons, mobile menu toggle)
            └── Routes
                ├── "/"          → redirect to "/tasks"
                ├── "/tasks"     → TasksPage
                │     ├── StatsGrid → StatCard ×4
                │     └── content-grid
                │         ├── TaskTable (filter buttons) → TaskRow ×N
                │         └── side-panels → DonutChart, ActivityList
                ├── "/dashboard" → DashboardPage  ┐
                ├── "/projects"  → ProjectsPage   │
                ├── "/calendar"  → CalendarPage   │
                ├── "/reports"   → ReportsPage    ├─ all render <PlaceholderPage icon title description />
                ├── "/team"      → TeamPage       │
                ├── "/clients"   → ClientsPage    │
                ├── "/documents" → DocumentsPage  │
                ├── "/settings"  → SettingsPage   ┘
                └── "*"          → redirect to "/tasks"
```

## Routing

- `react-router-dom` (`BrowserRouter`) wraps the app in `src/index.js`; `App.jsx` owns the `<Routes>`.
- Each sidebar entry in `src/data/dashboardData.js` carries a `path` (e.g. `/tasks`, `/projects`), which is the single source of truth used both by `Sidebar`'s `NavLink`s and by `App`'s route matching for the header's page title/breadcrumb.
- `Sidebar` no longer tracks "active" state manually — `NavLink`'s `isActive` (matched against the URL) drives the existing `.nav-item.active` styling, so the highlight and the green side-indicator work exactly as before, just URL-driven instead of click-state-driven.
- Only `/tasks` had real content in the original file; the other eight destinations (`داشبورد`, `پروژه‌ها`, `تقویم`, `گزارش‌ها`, `تیم`, `مشتریان`, `اسناد`, `تنظیمات`) render a shared `PlaceholderPage` component so every sidebar link goes somewhere, styled consistently with the existing `.panel` design language rather than introducing new visual patterns.
- On mobile, clicking any nav link also closes the slide-out sidebar (`onNavigate` callback), matching how a mobile nav typically behaves.

## State

| State (owner)                    | Purpose                                                            |
|-----------------------------------|---------------------------------------------------------------------|
| `searchQuery` (`App`)             | Text in the header search box — lifted here since the header is shared across all routes, but only `TasksPage` acts on it |
| `isMobile` / `sidebarOpen` (`App`) | Mobile breakpoint tracking (`window.innerWidth <= 768`) and slide-out sidebar visibility |
| `activeFilter` / `displaySource` (`TasksPage`) | Status filter and filter-vs-search precedence — scoped to the tasks page since no other route needs it |

`displaySource` (`'filter'` or `'search'`) reproduces the original's exact quirk: typing in the header search box overrides the status filter until the box is cleared, and clicking a filter button reverts to filter-based display regardless of what's still typed in the search box.

All task/activity/label/nav data lives in `src/data/dashboardData.js`, and the two small pure helpers (`toPersianNum`, `getProgressColor`) live in `src/utils/helpers.js` — matching the original script's data/logic split.

## Notable behavior preserved from the original

- **Search vs. filter precedence**: typing a query filters by name/description/assignee/ID and ignores the active status filter; clearing the search box resets to the "همه" (all) filter — exactly as the original `input` listener did.
- **Donut chart**: drawn on a `<canvas>` via the same trigonometry (start angle, gaps between segments, inner/outer radius) inside a `useEffect` that runs once on mount, with device-pixel-ratio scaling.
- **Mobile sidebar**: hidden off-canvas via `transform: translateX(100%)` under 768px, toggled by the hamburger button which only renders/displays on mobile — same as the original `checkMobile()`/`menuToggle` logic.
- **RTL/Persian**: `public/index.html` keeps `lang="fa" dir="rtl"` and the same three CDN stylesheets (Tailwind reset, Vazirmatn font, Font Awesome) the original used.

## Running it

```bash
npm install
npm start
```

(Built with Create React App's `react-scripts`; swap in Vite or any other bundler if preferred — no CRA-specific APIs are used beyond the standard `public/index.html` + `src/index.js` entry point.)
