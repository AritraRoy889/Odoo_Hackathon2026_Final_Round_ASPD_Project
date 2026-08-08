# 🏗️ Odoo Rental Management System: Technical Architecture & Flowcharts

---

## 🎯 Selected Industry Niche: Enterprise Tech & Hardware Rental (*OmniRent Pro*)
To maximize evaluator impact and showcase realistic high-value transactions (where security deposits, insurance, variant pricing, and technical specifications matter), **OmniRent Pro** targets **High-Performance Tech & Enterprise Hardware**:
- **Products**: NVIDIA H100/A100 AI Compute Rigs, RED Cinema 8K Cameras, Event Workstations, VR/AR Headsets, Drone Fleets.
- **Why it wins**: High rental value makes security deposits critical, 3D renders of hardware look stunning, and AI assistance is extremely natural when helping users pick complex hardware setups.

---

## 📊 Core System Flowcharts

### 1. End-to-End Customer Rental Journey
```mermaid
flowchart TD
    A[🌐 Splash & Portal Entry] --> B[🔑 Authentication / SSO]
    B --> C[📱 Browse Product Catalog]
    C --> D[🧊 Interactive 3D Product Inspection]
    C --> E[🤖 AI Rental Concierge Assistance]
    
    D & E --> F[📅 Select Rental Period & Duration]
    F --> G[⚡ Algorithmic Availability & Stock Check]
    
    G -- Available --> H[🛒 Add to Cart with Pricelist Rule]
    G -- Unavailable --> I[⚠️ Suggest Alternative Dates / Bundles]
    I --> F
    
    H --> J[🚚 Choose Delivery Option: Store Pickup vs. Shipping]
    J --> K[📋 Review Quotation & Rental Contract Terms]
    K --> L[💳 Online Payment: Base Rental + Security Deposit]
    L --> M[🧾 Automated Invoice Generation & Portal Receipt]
    
    M --> N[📦 Pickup / Delivery Confirmation via QR/Barcode]
    N --> O[⏳ Active Rental Period + Automated Smart Notifications]
    
    O --> P{🔄 Product Return at Agreed Time?}
    
    P -- On Time & Good Condition --> Q[✅ Full Security Deposit Refunded]
    P -- Late Return / Damage --> R[⚠️ Deduct Penalty from Deposit & Refund Balance]
    
    Q & R --> S[🌱 Eco-Impact Metrics Updated on User Profile]
```

---

### 2. Admin Operational & Warehouse Lifecycle
```mermaid
flowchart TD
    AA[⚙️ Admin Portal Login] --> BB[📦 Product & Variant Configuration]
    BB --> CC[💰 Pricelist & Time-Tier Matrix Setup]
    CC --> DD[📝 Quotation Template Creation]
    
    EE[📥 Incoming Offline / Online Rental Request] --> FF[📝 Draft Quotation Generated]
    FF --> GG[🔒 Lock Reservation Stock]
    GG --> HH[💳 Collect Deposit & First Payment]
    
    HH --> II[📋 Daily Pickup Schedule & Sequence]
    II --> JJ[🔍 Barcode / QR Code Scan on Handover]
    JJ --> KK[🚚 Asset Status: Active Rental]
    
    KK --> LL[📥 Daily Return Schedule Checklist]
    LL --> MM[🔍 Condition Inspection & Damage Check]
    
    MM --> NN{Inspect Result}
    NN -- Pass --> OO[💚 Refund 100% Deposit via Gateway]
    NN -- Overdue / Damaged --> PP[🛑 Run Penalty Calculator Algorithm]
    PP --> QQ[💸 Auto-Deduct Fee from Deposit -> Refund Remaining Balance]
    
    OO & QQ --> RR[📈 Real-Time Dashboard Metrics Updated]
```

---

### 3. Algorithmic Overlap & Availability Logic
```mermaid
flowchart TD
    Start([User Requests Product P, Quantity Q, Start Time S, End Time E]) --> Buffer[Add Maintenance/Turnaround Buffer: S_buff = S - T_buffer, E_buff = E + T_buffer]
    Buffer --> Fetch[Query Active Orders where Status in 'CONFIRMED', 'PICKED_UP']
    Fetch --> OverlapCheck[Find Overlapping Bookings: Existing_S < E_buff AND Existing_E > S_buff]
    OverlapCheck --> SumBooked[Calculate Max Concurrently Rented Stock during [S, E]]
    
    SumBooked --> CheckCap{Total_Stock - Max_Booked >= Q?}
    CheckCap -- Yes --> Approve[✅ Lock Temp Hold & Return Available]
    CheckCap -- No --> Reject[❌ Return Unavailable + Nearest Available Time Slots]
```

---

### 4. Security Deposit & Penalty Settlement Engine
```mermaid
flowchart TD
    Ret([Product Returned]) --> TimeCheck{Actual Return Time <= Scheduled Return Time + Grace Period?}
    
    TimeCheck -- Yes --> NoPenalty[Late Penalty = ₹0]
    TimeCheck -- No --> CalcPenalty[Calculate Overdue Hours/Days]
    
    CalcPenalty --> ApplyTier[Apply Penalty Rate from Pricelist Tier: e.g., 1.5x Hourly Rate]
    ApplyTier --> CapCheck{Penalty Amount > Max Late Fee Cap?}
    CapCheck -- Yes --> CapPenalty[Set Penalty = Max Late Fee Cap]
    CapCheck -- No --> FinalPenalty[Set Penalty = Calculated Amount]
    
    NoPenalty & CapPenalty & FinalPenalty --> Inspection[Check Damage / Missing Accessories]
    Inspection --> TotalDeduction[Total Deduction = Penalty + Damage Fee]
    
    TotalDeduction --> DepositCompare{Total Deduction >= Security Deposit?}
    DepositCompare -- Yes --> Forfeit[Forfeit Entire Security Deposit + Generate Balance Invoice]
    DepositCompare -- No --> PartialRefund[Refund = Security Deposit - Total Deduction]
    
    Forfeit & PartialRefund --> Gateway[Initiate Automated Gateway Refund/Charge & Audit Log]
```

---

## 🛠️ Complete Technical Stack Recommendation

| Component | Framework / Technology | Purpose |
| :--- | :--- | :--- |
| **Backend API** | **Django 5.0 / FastAPI** | Relational integrity, ACID transactions, complex interval queries, admin panel |
| **Database** | **PostgreSQL + PostGIS** | Time-range index (`TSTZRANGE`), JSONB attributes, pickup location spatial queries |
| **Frontend App** | **Vite + React 18 + TypeScript** | Lightning fast SPA, modular customer portal, real-time inventory calendar |
| **Styling & UI** | **Tailwind CSS + Lucide Icons + Shadcn UI** | High-end dark/light theme, modern glassmorphism, responsive grid |
| **3D Rendering** | **Three.js / React Three Fiber (`@react-three/fiber`)** | Interactive 3D product previews and digital twin inspection |
| **AI Agent** | **Google GenAI SDK (Gemini 3.6 / Flash)** | Natural language hardware bundling, contract queries, availability advice |
| **Payments** | **Razorpay / Stripe Webhooks** | Automated pre-authorization, deposit holding, and partial refund API calls |
| **Task Queue** | **Celery + Redis** | Automated return reminders ('N' days before), late fee trigger cron jobs |

---

## 🧮 Core Data Model Schema (Entity Relationship Outline)

```sql
-- 1. Product Table
CREATE TABLE products (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    total_stock INT NOT NULL,
    base_price_per_hour NUMERIC(10, 2),
    base_price_per_day NUMERIC(10, 2),
    security_deposit_amount NUMERIC(10, 2),
    model_3d_url VARCHAR(512),
    co2_savings_kg NUMERIC(6, 2)
);

-- 2. Pricelist Matrix
CREATE TABLE pricelists (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., 'Corporate VIP', 'Weekend Special'
    customer_tier VARCHAR(50),
    discount_percentage NUMERIC(5, 2),
    min_rental_duration_hours INT
);

-- 3. Rental Order & Contract
CREATE TABLE rental_orders (
    id UUID PRIMARY KEY,
    customer_id UUID REFERENCES users(id),
    status VARCHAR(50), -- DRAFT, QUOTATION, CONFIRMED, PICKED_UP, RETURNED, OVERDUE
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    total_rental_fee NUMERIC(10, 2),
    security_deposit_held NUMERIC(10, 2),
    penalty_deducted NUMERIC(10, 2) DEFAULT 0,
    qr_code_hash VARCHAR(256)
);

-- 4. Overlap Index Range Constraint (PostgreSQL TSTZRANGE)
CREATE EXTENSION btree_gist;
ALTER TABLE rental_order_items ADD CONSTRAINT no_overbooking 
EXCLUDE USING gist (product_id WITH =, TSTZRANGE(start_time, end_time) WITH &&);
```
