# TeamTask // Premium Collaborative Task Workspace

TeamTask is a high-fidelity, full-stack collaborative project workspace built with **React (Vite) + Node.js (Express) + Sequelize (SQLite/PostgreSQL)**. It features a premium, responsive glassmorphic UI with vibrant neon highlights, interactive Kanban task pipelines, multi-role access controls, and rich visual performance telemetry.

---

## 🚀 Key Features

### 1. Unified Authentication Gate
* **Signup / Login**: Instant secure token-based authentication (JWT) with password hashing via `bcryptjs`.
* **Developer Autofill**: Quick-access credentials to test as **System Administrator** or **Team Member** in one click.

### 2. Multi-Tier Role-Based Access Control (RBAC)
* **Global Level**:
  * **System Admin**: Complete visibility over all workspace directories, users, and administrative functions.
  * **Member**: Standard team member access to assigned projects.
* **Project Level**:
  * **Project Admin** (Creator/Owner): Full control over project configurations, inviting/removing team members, promoting member roles, creating tasks, and deleting projects.
  * **Project Member**: Can view members, create new tasks, and dynamically update pipeline task statuses.

### 3. Interactive Kanban Workspace Pipeline
* **Visual Status Management**: Tasks are divided into **Backlog (Todo)**, **Active Sprint (In Progress)**, and **Released (Completed)**.
* **Drag/Click-to-Move**: Click left/right toggles on task cards to instantly move task statuses in real-time.
* **Task Specifications Modal**: Create/edit tasks, assign members, configure milestones/due dates, and set Low/Medium/High priorities.

### 4. Real-time Telemetry Dashboard
* **KPI Telemetry**: Active projects count, total assigned tasks, completed percentages, and overdue warning widgets.
* **SVG Progress Dial**: Interactive, zero-dependency circular SVG progress gauges showing finished works.
* **Milestone Deadlines Feed**: View upcoming task schedules sorted chronologically.

---

## ⚙️ Technology Stack

* **Frontend**: React (Vite), Vanilla CSS (High-Performance Glassmorphism variables), Lucide Icons.
* **Backend**: Node.js, Express, Sequelize ORM (ES Modules structure).
* **Database**: SQLite (for zero-setup local execution) / PostgreSQL (via dynamic `DATABASE_URL` environment variables for cloud databases).
* **Deployment**: Pre-configured for automated **Railway** monorepo builds.

---

## 📂 Project Structure

```
teamtask-manager/
├── package.json               # Root scripts to install and run concurrently
├── .gitignore                 # Standard clean Git tracking filters
├── .env.example               # Reference environment variables
├── README.md                  # Comprehensive project manual
├── README.txt                 # Submission-ready manual text
├── server/                    # Node.js Express Backend
│   ├── config/db.js           # Sequelize connector (SQLite/Postgres switcher)
│   ├── controllers/           # API routes logic
│   ├── middleware/auth.js     # JWT & project RBAC middleware
│   ├── models/                # Database tables schemas & associations
│   ├── routes/api.js          # REST API endpoints routing
│   └── index.js               # Server entry & seed engine
└── client/                    # Vite React Frontend
    ├── index.html             # HTML entry & font links
    ├── vite.config.js         # Port configuration & dev server proxy
    └── src/
        ├── main.jsx           # React app mount
        ├── index.css          # Color tokens, styles & custom keyframes
        ├── context/AuthContext.jsx # Session context & Toast overlays
        ├── pages/             # App views
        └── App.jsx            # Orchestration layout
```

---

## 🛠️ Local Development Quickstart

### Prerequisites
* [Node.js](https://nodejs.org/) (v16.0.0 or higher recommended)

### Step 1: Install Dependencies
Run the unified installer script in the root directory to fetch packages for the root, frontend, and backend automatically:
```bash
npm run install-all
```

### Step 2: Launch Workspace
Run the concurrent dev command to boot the client (port `3000`) and the server (port `5000`) simultaneously:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Developer Accounts (Pre-Seeded)
The database automatically seeds on its first execution with three testing profiles (Password: `password123`):
1. **Alex Admin** (System Admin): `admin@teamtask.com`
2. **Jordan Member** (Project Member): `member@teamtask.com`
3. **Taylor Developer** (Project Member): `taylor@teamtask.com`

---

## 🌐 Railway Cloud Deployment

Railway will automatically detect the root `package.json` scripts, install all dependencies, build the React client bundle, and serve the application via the Express static routing engine.

### Zero-Config Steps:
1. Connect your GitHub repository to [Railway](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your `teamtask-manager` repository.
4. (Optional) To provision a PostgreSQL database, click **+ Add a Service** -> **Database** -> **PostgreSQL**. Railway will automatically map `DATABASE_URL` and the app will switch dialets seamlessly!
5. Deploy. The application will build and become live instantly!
