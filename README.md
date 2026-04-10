# 🚀 Astro Academy

A personalised 3-year astrophysics learning app for kids, built to take a 10-year-old from Grade 4 math to the frontiers of cosmology — one week at a time.

---

## What It Does

- **130 weeks** of structured lessons across **3 years** and **10 units**
- Covers: Numbers → Algebra → Geometry → Physics → Solar System → Coding (Scratch + Python) → Waves & Light → Stars & Cosmology → Relativity & Quantum → Research Projects
- Weekly homework (3 tasks + 1 BONUS), fun activities, and YouTube video tips
- **Gold coin** reward system (+10 coins per completed week, +5 per homework task)
- **Rocket builder** — 10 rocket parts unlock progressively as you complete weeks
- **15 achievements** to unlock along the journey
- Personalised with the student's **pilot name**
- **Multi-profile support** — each student saves their own `.json` progress file
- Space-themed dark UI with animated starfield and shooting meteors

---

## File Structure

```
AstroAcademy/
├── index.html    ← The app (open this in a browser)
├── style.css     ← All visual styling and animations
├── app.js        ← All app logic, navigation, progress tracking
└── data.js       ← All curriculum content (130 weeks of lessons)
```

> ⚠️ All 4 files must stay in the **same folder**. Do not move them apart.

---

## How to Run (No Server Needed)

1. **Unzip / copy** the `AstroAcademy` folder anywhere on your computer
2. **Open `index.html`** in **Chrome** or **Edge** (see browser notes below)
3. The **Mission Control profile screen** appears — create a new profile or load an existing one
4. Start learning! ✅

---

## How Progress Is Saved — Profile Files

Progress is saved to a **`.json` file on your computer**, chosen by you. This makes it:

- 🟢 **Portable** — copy it to any computer and load it
- 🟢 **Browser-independent** — not tied to Chrome's local storage
- 🟢 **Multi-profile** — one file per student, completely separate
- 🟢 **Shareable** — email or USB-transfer to a friend

### What's inside the profile file

```json
{
  "version": 2,
  "pilotName": "Jayden",
  "currentWeek": 14,
  "completedWeeks": [1, 2, 3, ...],
  "completedHW": { "w1_0": true, "w2_1": true, ... },
  "coins": 450,
  "coinsFromHW": 200,
  "coinsFromWeeks": 250,
  "savedAt": "2026-04-09T18:32:00.000Z"
}
```

---

## First Launch — Mission Control Screen

On every launch the **Mission Control** profile picker appears:

| Option | When to use |
|---|---|
| **📁 Load Existing Profile** | Returning student — pick their `.json` file |
| **✨ New Profile** | First time — enter name, choose where to save the `.json` |
| **⚡ Continue as "Name"** | Falls back to browser localStorage (appears only if old data exists) |

---

## Topbar Buttons

| Button | Action |
|---|---|
| 💾 | Save profile to file now (also lets you choose a new save location) |
| 👤 | Switch to a different profile (goes back to Mission Control) |

Progress also **auto-saves** to the file ~1.5 seconds after any action (completing a week, ticking homework).

---

## Sharing With a Friend

1. **Zip and send** the `AstroAcademy` folder (4 files, ~300 KB total)
2. Friend opens `index.html` in Chrome
3. They click **✨ New Profile**, enter their child's name, choose where to save their `.json`
4. Their progress is saved to their computer — completely separate from yours

Each family has their own `.json` file. Progress never mixes.

---

## Backup, Restore & Reset

### Back up progress
Just copy the `.json` profile file somewhere safe (cloud drive, USB, email to yourself).

### Restore from backup
Launch the app → **📁 Load Existing Profile** → select the backup `.json`.

### Move to a new computer
Copy both the `AstroAcademy` folder AND the `.json` profile file to the new computer. Open `index.html`, load the `.json`.

### Reset / start fresh
Launch the app → **✨ New Profile** → enter name → save to a new `.json` file.

---

## Curriculum Overview

| Year | Units | Weeks | Topics |
|---|---|---|---|
| **Year 1** | 1–4 | 1–50 | Numbers, Algebra, Geometry, Physics |
| **Year 2** | 5–7 | 51–84 | Solar System, Coding (Scratch + Python), Waves & Light |
| **Year 3** | 8–10 | 85–130 | Stars & Cosmology, Relativity & Quantum, Research Projects |

### Pedagogical Order (Key Design Decisions)
- ✅ **Algebra before physics** — so formulas like F=ma can actually be used
- ✅ **Square roots before Pythagoras** — Week 13, needed for Week 29
- ✅ **Trig as a dedicated 3-week block** — Weeks 35–37
- ✅ **Coding introduced early** — Week 65 (Scratch), Week 70 (Python)
- ✅ **Statistics as a dedicated 3-week block** — Weeks 82–84
- ✅ **Relativity & Quantum as their own unit** — not crammed with waves/EM

---

## Browser Compatibility

| Browser | File saving | Works? |
|---|---|---|
| **Chrome** (recommended) | ✅ Full file system access | ✅ |
| **Edge** | ✅ Full file system access | ✅ |
| **Firefox** | ❌ Falls back to localStorage | ⚠️ Partial |
| **Safari** | ❌ Falls back to localStorage | ⚠️ Partial |
| **Internet Explorer** | ❌ | ❌ |

> The File System Access API (used for `.json` profile files) requires Chrome or Edge. Firefox and Safari will still work but fall back to browser localStorage, which is less portable.

---

## Tech Stack

- Pure **HTML / CSS / JavaScript** — zero frameworks, zero dependencies, no npm
- No build tools, no server required
- **File System Access API** for `.json` profile saving
- **localStorage** as automatic fallback/cache
- Google Fonts (Orbitron + Exo 2) — CDN, cached after first visit

---

## Credits

Built with ❤️ for a future astrophysicist.
Curriculum designed to bridge from the Canadian elementary school system to university-level astrophysics.

*"Somewhere, something incredible is waiting to be known." — Carl Sagan*
