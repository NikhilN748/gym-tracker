# GymTracker — Workout Logger

A privacy-first, mobile-friendly workout tracker app built with React. All data stays in your browser via localStorage — no backend, no accounts, no tracking.

## Features

- **Workout Logging** — Log exercises, sets, reps, weight, RPE with live stats
- **Routines** — Create and save workout templates for quick starts
- **Rest Timer** — Automatic countdown with vibration alerts
- **PR Detection** — Live personal record tracking with toast notifications
- **Progress Charts** — Workout consistency, muscle distribution, volume over time
- **Body Measurements** — Track weight, body fat, and 11 body measurements
- **Progress Photos** — Upload and review compressed photos stored locally
- **Year in Review** — Annual stats summary
- **Dark Mode** — System-aware with manual toggle
- **Data Export/Import** — Full JSON backup and restore
- **Plate Calculator** — Visualize plates per side for target weight
- **Warmup Calculator** — Generate progressive warmup sets

## Tech Stack

- Vite + React 18
- React Router (HashRouter)
- Tailwind CSS
- Recharts
- Lucide React icons
- localStorage (no backend)

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server runs at `http://localhost:5173/gym-tracker/`.

## Deploy to GitHub Pages

1. Create a GitHub repository named `gym-tracker`
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/gym-tracker.git
   git push -u origin main
   ```
3. In your repo settings, go to **Pages** → **Source** → select **GitHub Actions**
4. The included `.github/workflows/deploy.yml` will automatically build and deploy on push to `main`
5. Your app will be available at `https://YOUR_USERNAME.github.io/gym-tracker/`

## Data Model

All data is stored in `localStorage` with the prefix `gymtracker:v1:`:

| Key | Description |
|-----|-------------|
| `exercises` | Seed exercise library (~65 exercises) |
| `customExercises` | User-created exercises |
| `routines` | Saved workout templates |
| `workouts` | Completed workout history |
| `activeWorkout` | Current in-progress workout |
| `settings` | User preferences (unit, dark mode, etc.) |
| `measurements` | Body measurement entries |
| `photos` | Progress photos (compressed base64) |
| `personalRecords` | PR tracking keyed by exercise ID |

## License

MIT
