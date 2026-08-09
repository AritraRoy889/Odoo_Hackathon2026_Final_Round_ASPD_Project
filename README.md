# 🪐 NeoRent — Premium Rental Protocol

> **Backend Stack:** FastAPI & Flask (Python-powered REST APIs & microservices)  
> **Frontend Stack:** React.js (Vite) & TailwindCSS (Cyberpunk Luxury design system)

NeoRent is an enterprise-grade, high-ticket asset leasing and multi-tenant rental management platform. Built to deliver maximum visual impact and robust ERP back-office capabilities, it provides users with real-time rental tracking, risk management, and intelligent logistics orchestration.

---

## 🚀 Key Features & WOW Factors

1. **Cyberpunk Luxury UI/UX Overhaul**: Built using deep obsidian layers, glassmorphism components, electric teal/violet accent animations, holographic hover states, and smooth gradient rendering.
2. **Dynamic Video Hero & Stats**: An engaging landing page header featuring a high-definition video background loop with dynamic stats counter overlays.
3. **Dual-Portal Roles**:
   - **Customer Portal**: Storefront product staging catalog, customized variant config picker, time-locked SVG QR Rental Passes, and a 3-step checkout wizard.
   - **Vendor Portal**: Vendor onboarding wizard (GST validations), inventory ledger, and order scheduling logs.
4. **Platform Administrator Console**:
   - **Order Logs**: Real-time list and Kanban views.
   - **⏱ Return countdown timers**: Live ticking return timers with accrue late-fee penalty accruals ($15/hr).
   - **🛡 AI Risk Oracle**: 6-factor algorithmic risk calculator displaying SAFE, CAUTION, or HIGH_RISK badges.
   - **📍 Stepper timelines**: A 7-stage animated horizontal progress timeline for all rental lifecycles.
5. **Smart Fuzzy Search**: Powered by Fuse.js for instant keyboard search suggestions matching product brands, tags, and titles.
6. **Multi-Currency Toggle**: Instantly swap entire application pricing between USD ($), EUR (€), GBP (£), and INR (₹) with real-time converted rates.
7. **Hands-free Voice Commands**: Back-office microphone control module parsing system queries (e.g. *"show late orders"*, *"open reports"*) using the Chrome Web Speech API.
8. **Interactive NeoBot Assistant**: Simulated AI chat assistant supporting quick suggestion replies, price guides, and support links.
9. **Executive PDF Export**: One-click reports tab exporting tabular sales logs and summary metrics into cleanly styled PDFs.
10. **Confetti Celebrations**: Live feedback mechanics celebrating finalized orders and posted invoices.

---

## 🛠 Installation & Setup Instructions

To run NeoRent locally on your machine, follow these instructions.

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Python 3.10+](https://www.python.org/)
- Git (optional, if downloading via terminal)

---

### Step 1: Clone or Download the Repository

```bash
git clone https://github.com/AritraRoy889/Odoo_Hackathon2026_Final_Round_ASPD_Project.git
cd Odoo_Hackathon2026_Final_Round_ASPD_Project
```
*(Or unzip the downloaded package and open the directory in your terminal/editor)*

---

### Step 2: Backend Setup (FastAPI & Flask Servers)

NeoRent features a python-based backend engine. Run these commands from the root directory:

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
2. **Start the API servers**:
   - To launch the backend REST API:
     ```bash
     python main.py
     ```
   - *Note: Ensure your backend server runs at `http://127.0.0.1:8000` so that the React frontend context can synchronize databases cleanly on mount.*

---

### Step 3: Frontend Setup (React & TailwindCSS)

1. **Install Node packages**:
   ```bash
   npm install
   ```
2. **Start the development server**:
   ```bash
   npm run dev
   ```
3. **Access the application**:
   - Open your browser and navigate to **`http://localhost:5173/`**.

---

### Step 4: Verification & Production Build

To verify your environment is ready for deploy, compile the production bundles:
```bash
npm run build
```
This generates optimized static chunks inside the `/dist` directory.
