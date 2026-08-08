# 🚀 OmniRent Pro — Odoo Hackathon 2026 Final Round (ASPD Track)

**Repository**: [Odoo_Hackathon2026_Final_Round_ASPD_Project](https://github.com/AritraRoy889/Odoo_Hackathon2026_Final_Round_ASPD_Project.git)  
**Collaborator / Contributor**: [avrojitsaha763-byte](https://github.com/avrojitsaha763-byte)  
**Theme**: Enterprise Rental Management System with AI Concierge, 3D Digital Twins & Ecological Impact Metrics  

---

## 📌 Project Overview
**OmniRent Pro** is an end-to-end Enterprise Rental Management Platform built for the Odoo Hackathon 2026 Final Round. It provides a unified portal for managing high-value technical hardware rentals, automating quotations, interval availability checking, pre-authorized security deposits, and return inspections.

---

## 🌟 Core Features

- **📦 Rental Product Management**: Duration-based pricing (per hour, day, week, month, year) with PostgreSQL `TSTZRANGE` interval availability check to prevent overbooking.
- **📄 Quotation to Contract Engine**: Self-service online quotations, instant confirmation into rental orders, and automatic invoice PDF generation.
- **💰 Pricelist Matrix**: Dynamic customer-tier pricelists (VIP, Corporate, Retail) with time-dependent rates and discount rules.
- **🔔 Smart Notifications**: Automated return reminders sent 'N' days before scheduled return date via Celery background tasks.
- **💳 Payment & Security Deposit Handling**: Secure payment pre-authorization holding deposits until asset return; automated penalty deduction for late returns.
- **📊 Admin Operations Dashboard**: Real-time tracking of active rentals, daily pickups/returns, overdue alerts, and held deposit totals.

---

## 🚀 "Wow" Factors

1. **🤖 AI Rental Concierge (Gemini 3.6 / Flash)**: Natural language hardware bundle builder and smart contract term summarizer.
2. **🧊 Interactive 3D Product Inspection (Three.js)**: 360° digital twin inspection of hardware before renting.
3. **🌱 Ecological Impact Dashboard**: Real-time calculation of $CO_2e$ offset and e-waste saved per rental transaction.

---

## 📚 Key Project Documentation

- 🏗️ **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Complete Technical Architecture, Data Schema & Mermaid Flowcharts.
- 🏆 **[PRESENTATION_DECK.md](./PRESENTATION_DECK.md)** — Stitched 10-Slide Pitch Presentation Deck & 3-Minute Judge Demo Script.

---

## 💻 Tech Stack
- **Frontend**: Vite + React 18 + Tailwind CSS + Three.js
- **Backend**: Django 5.0 REST Framework / FastAPI
- **Database**: PostgreSQL 16 (GIST Range Indexes)
- **AI Integration**: Google GenAI SDK (Gemini 3.6 / Flash)
- **Background Jobs**: Celery + Redis
