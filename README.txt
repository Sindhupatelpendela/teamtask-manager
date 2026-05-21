==========================================================================
                      TEAMTASK COLLABORATIVE WORKSPACE
                     Full-Stack Project & Task Manager
==========================================================================

TeamTask is a high-fidelity, full-stack collaborative project workspace 
built with React (Vite) + Node.js (Express) + Sequelize (SQLite/PostgreSQL). 
It features a premium, responsive glassmorphic UI, interactive Kanban 
task pipelines, multi-role access controls, and real-time performance 
telemetry widgets.

--------------------------------------------------------------------------
1. KEY FEATURES
--------------------------------------------------------------------------

* Unified Authentication Gate:
  - Instant signup / login powered by JWT token headers and bcryptjs.
  - Quick-access autofill credentials for evaluators (Admin & Member).

* Multi-Tier Role-Based Access Control (RBAC):
  - Global Level: Admin (sees all projects/users) and Member.
  - Project Level: Project Admin (can delete projects, invite/kick members,
    re-assign roles, and configure all tasks) and Project Member (can 
    view team, build tasks, and update pipeline statuses).

* Interactive Kanban Sprint Pipeline:
  - Three visual phases: Backlog (Todo), Active Sprint (In Progress), 
    and Released (Completed).
  - One-click task advancers to transition card status instantly.
  - Detailed task spec forms containing priority levels, assigned user, 
    due date calendar controls, and descriptions.

* Rich Telemetry Dashboard:
  - Responsive KPI cards, overdue task feeds, and upcoming milestone dates.
  - Custom SVG radial progress gauges (100% responsive, zero-dependency).

--------------------------------------------------------------------------
2. LOCAL DEVELOPMENT QUICKSTART
--------------------------------------------------------------------------

Prerequisites:
* Node.js (v16.0.0 or higher recommended)

Step 1: Install Dependencies
Run the unified installer script in the root directory to fetch packages 
for the root, frontend, and backend automatically:
  npm run install-all

Step 2: Launch Workspace
Run the concurrent dev command to boot the client (port 3000) and the 
server (port 5000) simultaneously:
  npm run dev

Open http://localhost:3000 in your browser.

--------------------------------------------------------------------------
3. PRE-SEEDED TEST PROFILES
--------------------------------------------------------------------------

The database automatically seeds on its first execution with three 
testing profiles (Password for all profiles: password123):

1. Alex Admin (System Admin)
   - Email: admin@teamtask.com
2. Jordan Member (Project Member)
   - Email: member@teamtask.com
3. Taylor Developer (Project Member)
   - Email: taylor@teamtask.com

--------------------------------------------------------------------------
4. RAILWAY CLOUD DEPLOYMENT
--------------------------------------------------------------------------

Railway will automatically detect the root package.json scripts, 
install all subproject dependencies, compile the React build bundle, 
and serve the app via the Express engine.

Deployment Steps:
1. Connect your GitHub repository to Railway (https://railway.app/).
2. Select "Deploy from GitHub repo" and choose this repository.
3. (Optional) To add a PostgreSQL database, click "+ Add a Service" 
   and select PostgreSQL. Railway will map the connection URL and the 
   ORM will switch dialects automatically.
4. Deploy. The application will be live instantly!
==========================================================================
