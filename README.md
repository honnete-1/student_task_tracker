# TaskForge — Student Task Tracker

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Local Storage](https://img.shields.io/badge/Local_Storage-4A90E2?style=flat&logo=databricks&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-000000?style=flat&logo=vercel&logoColor=white)

TaskForge is a precision-engineered student productivity application that helps you add tasks with due dates, track deadlines with priority indicators, and persist your data across browser sessions — all without a backend. Built with a premium Metallic Chic Bento Dashboard UI inspired by Apple hardware aesthetics and luxury productivity software.

**Live Demo:** [https://student-task-tracker-pi.vercel.app](https://student-task-tracker-pi.vercel.app)

---

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [How It Works](#how-it-works)
- [Git Commit History](#git-commit-history)
- [Deployment](#deployment)
- [License](#license)

---

## Features

- **Add Tasks** — Enter a task name and a due date, then instantly see it rendered on screen without any page reload
- **Input Validation** — The form blocks empty submissions and alerts the user with a clear inline error message
- **Deadline Priority Indicators** — Each task card is automatically color-coded:
  - 🔴 **Overdue** — past the due date
  - 🟡 **Due Today** — deadline is today
  - 🔵 **Upcoming** — future deadline
- **Delete Tasks** — Remove any task instantly with a single click; the card animates out smoothly
- **Local Storage Persistence** — All tasks are saved to the browser's Local Storage and automatically reloaded on every page refresh
- **Live Clock & Date Widget** — A real-time clock and calendar widget updates every second
- **Productivity Stats Dashboard** — Live counters show Total, Overdue, Due Today, and Upcoming task counts
- **Dark / Light Mode Toggle** — Switch between Liquid Silver (light) and Obsidian Titanium (dark) themes, with preference remembered across sessions
- **Empty State Design** — A clean, informative empty state is displayed when no tasks exist
- **Fully Responsive** — Mobile-first Bento Grid layout that adapts across phones, tablets, and desktops

---

## Screenshots

> _Add screenshots of your light mode and dark mode UI here_

| Light Mode | Dark Mode |
|------------|-----------|
| ![Light Mode](./screenshots/light.png) | ![Dark Mode](./screenshots/dark.png) |

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic page structure and accessible markup |
| **Tailwind CSS** | Utility-first styling, responsive layout, dark mode |
| **Vanilla JavaScript** | DOM manipulation, form validation, Local Storage |
| **CSS Custom Properties** | Theme variables for light and dark modes |
| **Local Storage API** | Client-side data persistence across sessions |
| **Google Fonts** | DM Sans (body) + Syne (headings) typography |
| **Vercel** | Deployment and live hosting |

---

## Project Structure

```
student-task-tracker/
│
├── index.html       # Main HTML file — semantic structure, Bento layout sections
├── style.css        # Custom styles — theme variables, card styles, animations
├── script.js        # All JavaScript logic — tasks, validation, Local Storage
└── README.md        # Project documentation
```

---

## Getting Started

No build tools, no npm, no dependencies to install. Just open the project.

### Run Locally

**Option 1 — Open directly in browser:**
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/student-task-tracker.git

# Open the file
cd student-task-tracker
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

**Option 2 — Use VS Code Live Server:**
1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code
2. Right-click `index.html` → **Open with Live Server**
3. Your browser opens automatically at `http://127.0.0.1:5500`

---

## How It Works

### Adding a Task
1. Type a task name in the **Task Name** input field
2. Select a due date using the **Date Picker**
3. Click **"Add Task to Forge"**
4. The task card appears instantly in the grid below with the correct priority colour

### Validation
- If either field is empty (or the task name contains only spaces), the form is blocked
- A red error message appears below the form header explaining what's missing
- On a successful submission, both inputs are cleared automatically

### Priority Detection
Every time a task is rendered, JavaScript compares today's date to the task's due date:

```
due date < today  →  Overdue  (red accent)
due date = today  →  Due Today (amber accent)
due date > today  →  Upcoming  (blue/cyan accent)
```

### Local Storage
Tasks are stored as a JSON array under the key `taskforge-tasks`:

```js
// Saving
localStorage.setItem("taskforge-tasks", JSON.stringify(tasks));

// Loading on page refresh
const saved = JSON.parse(localStorage.getItem("taskforge-tasks")) || [];
```

When the page loads, the saved array is read and every task is re-rendered to the DOM, so no data is ever lost on refresh.

### Dark Mode
The theme toggle adds or removes the `dark` class on the `<html>` element. Tailwind's `dark:` variant utilities then apply the Obsidian Titanium colour palette. The user's preference is saved to Local Storage so it persists between visits.

---

## Git Commit History

This project was built following a professional incremental workflow with **10 logical commits**:

| # | Commit Message |
|---|---|
| 1 | `init: initialize repository and set up basic HTML5 boilerplate` |
| 2 | `feat: build responsive Navbar and Hero Bento section` |
| 3 | `feat: design Task Entry Form and Display Area with Tailwind CSS` |
| 4 | `feat: add live clock widget and productivity stats panel` |
| 5 | `feat: implement JS form validation for task name and date fields` |
| 6 | `feat: add JS logic to dynamically render task cards with priority indicators` |
| 7 | `feat: implement delete functionality with fade-out animation` |
| 8 | `feat: integrate Local Storage to save and load tasks on refresh` |
| 9 | `feat: add dark/light mode toggle with theme persistence` |
| 10 | `polish: refine responsive layout, hover states, and empty state design` |

---

## Deployment

This project is deployed on **Vercel** and also supports **GitHub Pages**.

### Deploy to GitHub Pages

1. Push your code to a public GitHub repository
2. Go to your repo → **Settings** → **Pages**
3. Under *Build and deployment*, set the source to the `main` branch, root folder `/`
4. Click **Save** — your site will be live at `https://honnete-1.github.io/student-task-tracker`

### Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"** and import your repository
3. Leave all settings as default (no build command needed for a static site)
4. Click **Deploy** — Vercel provides a live URL instantly

---

