<div align="center">

# ⏱ KRONOS

**Brutally minimal athlete timer & streak tracker**

Built with React + Vite + Tailwind CSS

[Live Demo →](https://yourusername.github.io/kronos/)

</div>

---

## ✨ Features

### 🏗️ Session Builder
- **4 default presets** — TABATA, HIIT, ENDURANCE, SPRINT
- **Custom presets** — Save & load your own sessions
- **Drag-and-drop** — Reorder rounds freely
- **Inline editing** — Tap to change round name, work/rest durations
- **Duplicate** — Clone rounds or entire sessions (×2, ×3, ×4)

### ⏱ Interval Timer
- Massive countdown display with orbital particle system
- **WORK** phase — white particles orbiting, speed increases as time runs out
- **REST** phase — amber particles in a breathing circle
- Phase transition audio cues (Web Audio API)
- Tap-anywhere-to-pause
- Session summary with progress ring on completion

### ⏲ Stopwatch
- Count-up timer with centisecond precision (MM:SS.cs)
- Lap recording with split + total times
- Orbital particles speed up over time

### 🔥 Streak Tracker
- GitHub-style heatmap (52 weeks × 7 days)
- Month-separated columns for easy reading
- Current streak, best streak, total sessions
- Hover tooltips with date + count
- Persisted in localStorage

### 🎬 Welcome Screen
- Particle animation forming "KRONOS" text
- Converge → hold → scatter sequence

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS 3 |
| **Audio** | Web Audio API |
| **Animation** | HTML5 Canvas + requestAnimationFrame |
| **Persistence** | localStorage |
| **Deployment** | GitHub Pages |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & Run

```bash
# Clone the repo
git clone https://github.com/yourusername/kronos.git
cd kronos

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📦 Deploy to GitHub Pages

### Automatic (recommended)

1. Push your code to a GitHub repo named `kronos`
2. Go to **Settings → Pages → Source** → select **GitHub Actions**
3. Push to `main` branch — the included workflow will build and deploy automatically

### Manual

```bash
npm run build
```

Then upload the `dist/` folder to your GitHub Pages branch.

> **Note**: The `vite.config.js` has `base: '/kronos/'` configured. If your repo name is different, update the `base` path accordingly.

---

## 📁 Project Structure

```
kronos/
├── public/
│   ├── banner.png          # Header banner image
│   └── favicon.png         # App favicon
├── src/
│   ├── components/
│   │   ├── Controls.jsx    # Play/Pause/Stop/Lap buttons
│   │   ├── NavBar.jsx      # Bottom navigation tabs
│   │   ├── OrbitalCanvas.jsx # Canvas particle system
│   │   ├── PresetStrip.jsx # Preset chips with save/delete
│   │   ├── RoundCard.jsx   # Draggable round editor
│   │   ├── StreakGrid.jsx  # Heatmap calendar
│   │   └── TimelineStrip.jsx # Round progress dots
│   ├── hooks/
│   │   ├── useStopwatch.js # Count-up timer logic
│   │   ├── useStreak.js    # Streak persistence
│   │   └── useTimer.js     # Interval countdown logic
│   ├── screens/
│   │   ├── BuilderScreen.jsx   # Session configuration
│   │   ├── StopwatchScreen.jsx # Count-up timer
│   │   ├── StreakScreen.jsx    # Streak stats + heatmap
│   │   ├── TimerScreen.jsx    # Active countdown (hero)
│   │   └── WelcomeScreen.jsx  # Particle splash screen
│   ├── utils/
│   │   ├── audio.js        # Web Audio API beep generator
│   │   └── time.js         # Time formatting utilities
│   ├── App.jsx             # Root component + routing
│   ├── index.css           # Design system + Tailwind
│   └── main.jsx            # Entry point
├── .github/workflows/
│   └── deploy.yml          # GitHub Pages CI/CD
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🎨 Design

- **Pure black** background (`#000000`)
- **Accent blue** for work phase (`#C8D8FF`)
- **Warm amber** for rest phase (`#C8A86B`)
- **Font**: Elms Sans via Google Fonts
- **Animations**: Canvas particles, CSS transitions, screen crossfades

---

## 📄 License

MIT
