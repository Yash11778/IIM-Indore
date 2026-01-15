# OaaS Engine - IIM Indore Hackathon Submission
### *The "Hiring-Ready" Behavioral & Technical Audit System*

Welcome to the **Outcome-as-a-Service (OaaS) Engine**, an Agentic AI-powered simulation platform designed to bridge the gap between EdTech certification and corporate employability.

---

## 🚀 The Problem
Massive EdTech companies sell expensive certifications, but graduates often fail technical interviews due to a lack of "Day-One Readiness." Traditional quizzes (MCQs) test knowledge, not behavior.

## 💡 The Solution
The **OaaS Engine** is a "Headless Corporate Sandbox" where candidates are placed in a simulated role (e.g., Full Stack Engineer) and must solve real-world crises. 

We track **INTEGRITY** (Focus/Cheating) and **ROI** (Financial Impact) without invasive measures.

---

## ✨ Key Features

### 1. Headless Corporate Sandbox (The Virtual Workplace)
*   **Terminal (SSH)**: A fully interactive simulated CLI where candidates must use `ps`, `netstat`, `grep`, and `set-config` to debug live system outages.
*   **IDE (Code Editor)**: A HackerRank-style editor for optimizing algorithms under pressure.
*   **AI Manager**: A "Persona Agent" (Google Gemini Pro) that acts as a boss, sending tasks and dynamic feedback via a corporate chat interface.

### 2. Neuro-Link Biometrics™ (Behavioral Integrity)
*   **Focus Tracking**: Monitors tab-switching (`document.hidden`) to detect if a candidate is "Googling answers."
*   **Integrity Score**: Real-time deduction of score based on distraction events.
*   **Privacy-First**: No webcams or screen recording required.

### 3. Flashback ROI Engine (Recruiter Dashboard)
*   **Financial Projections**: Instead of a "Test Score," we show **Projected 1st Year Savings** (e.g., $45,000).
*   **Decision Trace**: A visual timeline of the candidate's cognitive load and decision-making process during the crisis.
*   **Ramp-Up Prediction**: Estimates how many days until the hire becomes productive (e.g., 3 Days vs Industry Avg 45 Days).

---

## 🛠️ Tech Stack

*   **Frontend**: React.js + Vite
*   **Styling**: Tailwind CSS + Lucide React (Glassmorphism UI)
*   **AI Layer**: Google Gemini Pro API (Agentic Orchestration)
*   **Backend**: Node.js + Express
*   **Database**: MongoDB (Session Logging & Audit Metrics)
*   **Simulation**: Custom "Mock OS" logic for Terminal and File System

---

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas)
*   Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/Yash11778/IIM-Indore.git
cd IIM-Indore
```

### 2. Setup Server
```bash
cd OaaS-Engine/server
npm install
# Create .env file with:
# PORT=5001
# MONGO_URI=mongodb://localhost:27017/oaas_db
# GEMINI_API_KEY=your_key_here
npm start
```

### 3. Setup Client
```bash
cd OaaS-Engine/client
npm install
npm run dev
```

### 4. Access the App
Open `http://localhost:5173` in your browser.

---

## 🎮 Demo Walkthrough (The "Golden Path")

1.  **Login**: Choose "Full Stack Engineer" role.
2.  **Dashboard**: Notice the "Neuro-Link Active" HUD. Try switching tabs to see the "Focus Loss" warning.
3.  **The Crisis**: The AI Manager reports a Database Outage.
4.  **Terminal**:
    *   Type `help` to see commands.
    *   Type `logs` to see the error.
    *   **Winning Move**: Type `set-config pool 200` to scale the database.
5.  **IDE**: Solve the coding challenge.
6.  **Recruiter View**: Click "View Report" to see the Financial ROI and Behavioral Analysis.

---

*Built for IIM Indore Hackathon 2026*
