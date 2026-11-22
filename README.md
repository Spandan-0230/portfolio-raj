<div align="center">

  # ✦ Spandan Bole — Developer Portfolio

  <p align="center">
    <strong>A high-performance, cinematic 3D developer portfolio featuring frame-scrubbed canvas rendering, live GitHub telemetry, interactive Three.js robotics, volumetric shockwave particle systems, and deep-dive project showcases.</strong>
  </p>

  <p align="center">
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.4.6-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.3.0-149eca?style=for-the-badge&logo=react&logoColor=white" alt="React" /></a>
    <a href="https://threejs.org"><img src="https://img.shields.io/badge/Three.js-0.187.0-black?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" /></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-4.3.3-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  </p>

  <p align="center">
    <a href="#-key-features">Key Features</a> •
    <a href="#-architecture--tech-stack">Tech Stack</a> •
    <a href="#-project-structure">Project Structure</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-environment-variables">Environment Variables</a> •
    <a href="#-connect">Connect</a>
  </p>

</div>

---

## 🌟 Highlights

- **Cinematic Canvas Scrubber**: 196 ultra-high-resolution WebP frames smoothly scrubbed on scroll using linear interpolation (`LERP = 0.085`), dynamic canvas aspect ratio scaling, and persistent predictive in-memory frame preloading.
- **Volumetric 3D Smoke Launch & Interactive Robot**: A delayed high-energy launch sequence featuring multi-tier particle dynamics (black soot shadows, smoky ash mid-tones, brilliant white vapor plumes, and dual shockwaves) that seamlessly transitions to an interactive Three.js pointer-tracking 3D robot.
- **Real-Time GitHub Telemetry**: Live contribution heatmaps, commit activity logs, and dynamic repository language breakdown fetched directly via GitHub REST/GraphQL API routes.
- **Interactive Deep-Dive Modals**: Full-screen project galleries (BioSync, Digital Ledger, FloatView) featuring self-hosted **Agràve Pro** typography, custom cursor states, and pinned frosted-glass exit controls.
- **Dynamic Viewport Navigation**: Floating header with real-time `getBoundingClientRect` viewport tracking, animated glowing underline indicators, and context-aware contact button state transitions.

---

## 🚀 Key Features

### 🎞️ Cinematic Frame Scrubber (`app/page.tsx`)
* **196-Frame WebP Sequence**: High-fidelity video frame playback mapped directly to scroll velocity.
* **Predictive Frame Cache**: Decoupled in-memory caching engine that prioritizes frames nearest to the viewport, eliminating scroll stuttering.
* **Smooth Damping**: Native scroll dampening and dynamic canvas coordinate scaling (`rw`, `rh`, `ox`, `oy`) ensuring razor-sharp fidelity on Retina/4K displays.

### 🤖 3D Robot & Volumetric Smoke VFX (`SmokeBurst.tsx` & `RobotViewer.tsx`)
* **Delayed Shockwave Sequence**: Triggers automatically upon reaching the character stage, expanding two distinct radial shockwaves accompanied by 85+ individual particles across 4 volumetric density tiers.
* **Interactive 3D Robot**: Powered by Three.js with realistic studio lighting, environment maps, and smooth mouse/touch head tracking.

### 📊 Live GitHub Activity & Skills Breakdown (`GithubActivity.tsx` & `LanguageShowcase.tsx`)
* **Live Activity**: Fetches and renders your actual GitHub contribution matrix and recent push activity via `/api/contributions`.
* **Language Telemetry**: Dynamic breakdown of top languages used across public repositories via `/api/languages`, complete with interactive flip cards and proficiency details.

### 💼 Project Showcases & Galleries (`BioSyncGalleryModal.tsx` & `LedgerGalleryModal.tsx`)
* **BioSync**: Biometric telemetry, continuous heart rate zones, multi-sensor BLE pairing, and clinical analytics.
* **Digital Ledger**: High-volume financial ledger, SKU inventory tracking, customer khata credit management, and audit statements.
* **FloatView**: Picture-in-picture desktop overlay, hardware compositing, and DWM window preview showcase.
* **Pinned Modals**: Pinned `✕ Close` button with frosted-glass backdrop (`backdrop-filter: blur(16px)`) isolated from scroll viewports.

### 📬 Matte Dark Contact Interface (`ContactForm.tsx`)
* **Form Validation**: Strict email regex matching, live 1000-character limit counter, and interactive submission feedback states (idle, submitting, success, error).
* **Automated Email Forwarding**: Serverless API route (`/api/contact`) configured for transactional email delivery via Resend.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16 (App Router)** | Server-side rendering, API routes, Turbopack & Webpack optimization |
| **Core UI** | **React 19** | Component architecture, hooks, and modern rendering lifecycle |
| **3D & Graphics** | **Three.js** | WebGL 3D model rendering, lighting, camera controls, and head tracking |
| **Canvas Animation** | **HTML5 Canvas 2D API** | High-performance frame interpolation and particle shockwaves |
| **Styling** | **Tailwind CSS 4 + Styled JSX** | Component-scoped CSS, frosted glassmorphism, responsive clamping |
| **Typography** | **Agràve Pro & Geist Sans** | Custom self-hosted luxury sans-serif font for project showcases |
| **Email Service** | **Resend** | Transactional contact form message delivery |
| **Data Fetching** | **GitHub API** | Live user contribution graphs and language analytics |

---

## 📁 Project Structure

```bash
portfolio-raj/
├── app/
│   ├── api/
│   │   ├── contact/route.ts        # Contact form email forwarder (Resend API)
│   │   ├── contributions/route.ts  # GitHub contributions telemetry
│   │   └── languages/route.ts      # GitHub repository language breakdown
│   ├── components/
│   │   ├── BioSyncGalleryModal.tsx # Fullscreen modal gallery for BioSync
│   │   ├── ContactForm.tsx         # Dark matte contact form with validation
│   │   ├── FloatViewShowcase.tsx   # Picture-in-picture window tool showcase
│   │   ├── GithubActivity.tsx      # GitHub heatmap and activity dashboard
│   │   ├── Header.tsx              # Floating header with animated underline nav
│   │   ├── HeadTrackingSection.tsx # Combined 3D robot + smoke burst landing stage
│   │   ├── LanguageShowcase.tsx    # Interactive skills / language telemetry
│   │   ├── LedgerGalleryModal.tsx  # Fullscreen modal gallery for Ledger
│   │   ├── LedgerShowcase.tsx      # Retail bookkeeping & ledger showcase
│   │   ├── ProjectsShowcase.tsx    # BioSync showcase cards
│   │   ├── PureImagePopup.tsx      # Lightbox preview modal for high-res screenshots
│   │   ├── RobotViewer.tsx         # Three.js 3D character with head tracking
│   │   ├── ScrollPrompt.tsx        # Filmic scroll prompt indicator
│   │   ├── SideMargins.tsx         # Filmic decorative side margins
│   │   ├── SmokeBurst.tsx          # Volumetric particle smoke & shockwave VFX
│   │   ├── SmoothScrollDamper.tsx  # Smooth scroll dampening controller
│   │   └── WorksShowcase.tsx       # Selected works and engineering overview
│   ├── globals.css                 # Global styling, font-face definitions, resets
│   ├── layout.tsx                  # Root layout, metadata, favicon configuration
│   └── page.tsx                    # Main cinematic canvas scrubber & orchestrator
├── public/
│   ├── fonts/                      # Self-hosted Agràve Pro font files (.woff2, .ttf)
│   ├── webp_frames/                # 196 optimized WebP cinematic video frames
│   ├── logo.png                    # SB Monogram logo
│   ├── icon.png                    # Site favicon / app icon
│   └── margin-strip.png            # Filmic decorative borders
├── next.config.ts                  # Next.js configuration
├── package.json                    # Project dependencies and scripts
└── tsconfig.json                   # TypeScript configuration
```

---

## ⚡ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.18.0 or later recommended)
- `npm`, `pnpm`, or `yarn`

### 1. Clone the Repository

```bash
git clone https://github.com/Spandan-0230/portfolio-raj.git
cd portfolio-raj
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local  # If .env.example exists, or create manually:
```

Add your credentials:

```env
# Optional: Resend API Key for live contact form submissions
RESEND_API_KEY=re_your_api_key_here
CONTACT_FORWARD_TO=spandanbole777@gmail.com

# Optional: GitHub Personal Access Token (PAT) to prevent API rate-limiting on live telemetry
GITHUB_TOKEN=ghp_your_github_token_here
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to experience the site.

### 5. Build for Production

```bash
npm run build
npm run start
```

---

## 🤝 Connect

- **Portfolio**: [Spandan Bole](https://github.com/Spandan-0230)
- **GitHub**: [@Spandan-0230](https://github.com/Spandan-0230)
- **LinkedIn**: [Spandan Bole](https://www.linkedin.com/in/spandan-bole-pr3020/)
- **Email**: [spandanbole777@gmail.com](mailto:spandanbole777@gmail.com)

---

<div align="center">
  <sub>Designed & engineered with precision by Spandan Bole.</sub>
</div>
