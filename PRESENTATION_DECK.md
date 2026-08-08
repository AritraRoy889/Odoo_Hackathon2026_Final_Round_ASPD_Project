# 🏆 Stitched Hackathon Presentation Deck & Judge Pitch Script
## Project Title: **OmniRent Pro — Next-Gen Smart Enterprise Rental Platform**
**Hackathon Target**: Odoo Hackathon 2026 Final Round (ASPD Track)  
**Theme**: Enterprise Rental Management System + AI & 3D Wow Factors  

---

## 📸 Presentation Slide Deck Overview

```
 ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
 │ SLIDE 1: Title & Vision │  │ SLIDE 2: Problem & Friction│ │ SLIDE 3: OmniRent Solution│
 └─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
 ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
 │ SLIDE 4: Architecture   │  │ SLIDE 5: Availability Algo││ SLIDE 6: Deposit Engine │
 └─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
 ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
 │ SLIDE 7: AI Concierge   │  │ SLIDE 8: 3D Twin & Eco  │  │ SLIDE 9: Admin Dashboard│
 └─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
                              ┌─────────────────────────┐
                              │ SLIDE 10: Pitch & Demo  │
                              └─────────────────────────┘
```

---

## 🎨 Slide-by-Slide Presentation Breakdown

### 📍 Slide 1: Cover & Vision
- **Slide Title**: **OmniRent Pro — Frictionless Enterprise Rental Operations**
- **Subtitle**: *Automating the Full Rental Lifecycle with Time-Interval Logic, AI Concierge & 3D Asset Twins*
- **Visual Design**: Sleek Odoo Purple & Midnight Slate Dark Mode theme, showing 3D render preview of high-performance tech equipment.
- **Key Takeaway**: We transformed traditional rental management into a automated, zero-friction e-commerce ecosystem for enterprise hardware.

---

### 📍 Slide 2: The Core Industry Challenges (Why Rentals Fail Today)
- **Slide Title**: **Friction in the Rental Lifecycle**
- **Key Points & Graphics**:
  1. **Overbooking Chaos**: Double-booking errors due to manual spreadsheet calculations.
  2. **Security Deposit Disputes**: Opaque deposit handling, delayed refunds, manual penalty calculations.
  3. **Operational Blind Spots**: Lack of real-time visibility into today's pickups, overdue returns, and revenue.
  4. **Poor Customer Experience**: Clunky ordering flows with zero clear contract visibility or automated reminders.
- **Speaker Note**: *"Rental businesses lose 15-20% of revenue to delayed returns and deposit friction. Manual workflows kill customer trust."*

---

### 📍 Slide 3: The OmniRent Solution Matrix
- **Slide Title**: **A Unified Platform for Portal Users & Operations**
- **Side-by-Side Comparison**:
  - **Customer Portal**: Self-serve browsing, interactive 3D inspection, instant quotation confirmation, online deposit payments, and self-service return status.
  - **Admin Command Center**: Real-time operations dashboard, QR barcode scanning, automated deposit settlement, time-tiered pricelists, and customizable return alerts.
- **Visual**: Split screen comparing Customer Web App UI vs. Admin Management Dashboard.

---

### 4. Slide 4: End-to-End System Architecture
- **Slide Title**: **Robust, High-Performance Tech Stack**
- **Architecture Diagram**:
  ```
  [ Vite + React 18 + Tailwind ]  <--->  [ Gemini 3.6 AI SDK ]
                │                                    │
  [ Three.js 3D Digital Twin ]            [ AI Hardware Concierge ]
                │                                    │
                └───────────► [ Django REST API ] ◄──┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    ▼                                   ▼
          [ PostgreSQL TSTZRANGE ]           [ Celery + Redis Reminders ]
          (Interval Overlap Locking)        (Customizable N-Day Alerts)
  ```
- **Key Architectural Highlights**:
  - PostgreSQL `TSTZRANGE` index guarantees zero double-booking at database constraint level.
  - Celery worker triggers customizable **'N' days automated email/SMS reminders**.

---

### 📍 Slide 5: The Overlap Prevention Engine (Algorithmic Logic)
- **Slide Title**: **Nailing the Hard Core: Interval Availability Logic**
- **Mathematical Formula & Code Concept**:
  $$\text{Available Stock}(P, [S, E]) = \text{Total Stock}(P) - \max_{t \in [S - T_{buff}, E + T_{buff}]} \left( \sum_{O \in \text{ActiveOrders}} O.\text{qty}(P, t) \right)$$
- **Highlights**:
  - Supports custom rental durations: **Hourly, Daily, Weekly, Monthly, Yearly**.
  - Dynamic buffer management ($T_{buff}$) for product cleanup/inspection between rentals.
  - Real-time slot suggestions when a requested window is sold out.

---

### 📍 Slide 6: Automated Security Deposit & Late Return Settlement
- **Slide Title**: **Automated Deposit Lifecycle & Late Penalty Engine**
- **Workflow Highlights**:
  - **Deposit Capture**: Pre-authorized during payment alongside quotation confirmation.
  - **On-Time Return**: Scan QR code -> Condition verification -> **Instant 100% automated refund**.
  - **Late Return Logic**:
    $$\text{Penalty} = \min\Big(\text{Overdue Hours} \times \text{Pricelist Rate} \times \text{Multiplier}, \, \text{Late Fee Cap}\Big)$$
  - Deducts penalty from deposit, returns remaining balance automatically, updates audit log.

---

### 📍 Slide 7: The "Wow" Factor #1 — AI-Powered Rental Concierge
- **Slide Title**: **Intelligent Rental Assistant (Gemini-Powered)**
- **Feature Capabilities**:
  - **Contextual Hardware Bundle Matching**: User types *"I need a multi-camera rig for a 3-day outdoor shoot"*, AI suggests camera + lens + battery pack + storage bundle.
  - **Contract & Term Summarization**: Instant plain-language breakdown of deposit terms, late return grace periods, and liability policies.
  - **Real-Time Availability Query**: Integrated directly into stock API.

---

### 📍 Slide 8: The "Wow" Factor #2 & #3 — 3D Twin & Eco Impact
- **Slide Title**: **Interactive 3D Inspection & Ecological Betterment**
- **Interactive 3D Digital Twins**:
  - Powered by Three.js & React Three Fiber.
  - Customers can rotate, zoom, inspect ports, and view dimension specs before renting.
- **Ecological Betterment Dashboard**:
  - Calculates carbon offset ($CO_2e$) and e-waste saved per rental vs. manufacturing new items.
  - Enhances customer presentation pitch with circular economy narrative.

---

### 📍 Slide 9: Admin Operations Dashboard & Analytics
- **Slide Title**: **Command Center for Rental Managers**
- **Dashboard Widgets**:
  - 📊 **Active Rentals KPI Card** & Revenue Tracker
  - 🚚 **Pickups & Returns Due Today** (Interactive Checklist)
  - ⚠️ **Overdue Rentals Alert Feed**
  - 💰 **Deposits Currently Held vs. Penalties Collected**
  - 🔍 **QR Barcode Scanner Modal** for rapid store pickup & check-in.

---

### 📍 Slide 10: Hackathon Pitch & Live Demo Script (3-Minute Demo)
- **Slide Title**: **Winning Execution & Demo Strategy**

#### ⏱️ 3-Minute Live Judge Demo Script:
1. **[0:00 - 0:45] Customer Journey & 3D Experience**:
   - Open portal, navigate to high-end Tech hardware (e.g., NVIDIA Rig / Cinema Camera).
   - Show 3D digital twin spin preview. Use AI Concierge to ask: *"What equipment do I need for a 48-hour hackathon streaming station?"*
2. **[0:45 - 1:30] Dynamic Pricelist & Overlap Prevention**:
   - Select dates. Show how pricelist automatically adjusts price from hourly to daily tier.
   - Try selecting an already-booked time slot -> Show instant overbooking prevention & calendar slot suggestion.
3. **[1:30 - 2:15] Checkout, Payment & Deposit**:
   - Complete checkout with security deposit pre-authorization. Show instant invoice generation & downloadable PDF receipt with QR Code.
4. **[2:15 - 3:00] Admin Return & Deposit Settlement**:
   - Switch to Admin Dashboard. Show pickup schedule.
   - Scan QR code -> Simulate late return -> Watch the system calculate exact penalty, deduct from deposit, refund balance, and update Eco-Impact stats.

---

## 🎯 Alignment with Odoo Evaluation Criteria

| Evaluator Requirement | OmniRent Pro Implementation | Status |
| :--- | :--- | :---: |
| **Rental Product & Availability** | Custom rental durations (hour/day/week) + Calendar visual availability | ✅ 100% |
| **Quotation to Contract** | Quotation templates, online customer review, confirmation & invoice PDF | ✅ 100% |
| **Pricelist Management** | Multi-tiered customer pricelists (VIP/Corporate) & duration-based rules | ✅ 100% |
| **Smart Notifications** | Automated customizable 'N'-day return reminders via Celery/Redis | ✅ 100% |
| **Payment Integration** | Online payment flow with deposit pre-authorization & automated refund | ✅ 100% |
| **Returns & Late Handling** | Automated late fee formula, grace period, deposit deduction engine | ✅ 100% |
| **Operations Dashboard** | Real-time KPIs for active rentals, pickups due, overdue alerts & deposits | ✅ 100% |
| **Technical Ambition ("Wow")** | Gemini AI Concierge + Three.js 3D Digital Twin + Eco Impact Tracker | 🚀 Elevated |
