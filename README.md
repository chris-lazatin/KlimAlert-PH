# 🌧️ KlimAlert PH
### Community-Based Disaster Preparedness & Alert System — Olongapo City, Zambales

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Platform](https://img.shields.io/badge/Platform-Web_App-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![PHP](https://img.shields.io/badge/Backend-PHP%2FMySQL-777BB4)
![License](https://img.shields.io/badge/License-MIT-yellow)

> Capstone Project · **Christopher V. Lazatin** · Gordon College, BSIT 2nd Year

---

## 📌 Overview

**KlimAlert PH** is a full-stack community disaster preparedness web application built specifically for barangay residents of **Olongapo City, Zambales, Philippines**. It combines real-time hazard reporting, live evacuation center tracking, bilingual preparedness guides, and an AI-powered chatbot to keep communities informed and safe before, during, and after natural disasters.

---

## ✨ Features

### 🔔 Real-Time Alerts
- Live disaster alerts from **PAGASA** and **City DRRMO Olongapo**
- Severity-coded warnings for typhoons, floods, earthquakes, and more
- Dashboard stats: active alerts, open evacuation centers, daily reports

### 🗺️ Evacuation Center Map
- Interactive **Leaflet.js** map of all Olongapo evacuation centers
- Real-time capacity tracking (OPEN / NEAR FULL / FULL / CLOSED)
- Facility info, barangay managers, and contact numbers per center
- Only shows centers with available capacity — powered by a MySQL view (`v_available_evac_centers`)

### 📋 Hazard Reporting
- Citizens, volunteers, and LGU officers can submit hazard reports
- Supports: flood, fire, landslide, fallen tree, road blocked, power outage
- Photo upload (JPG/PNG ≤ 5MB), GPS coordinates, anonymous reporting option
- Report statuses: pending → verified → resolved

### 📖 Bilingual Preparedness Guides
- Guides for: **Typhoon, Earthquake, Flood, Fire, Tsunami, Landslide**
- Available in **English and Filipino (Tagalog)**
- Sourced from PAGASA, NDRRMC, PHIVOLCS, and Philippine Red Cross
- Structured in Before / During / After phases

### 🤖 KlimaBot — AI Assistant
- Bilingual AI chatbot (English / Tagalog / Taglish)
- Covers: go-bag preparation, evacuation guidance, emergency contacts
- Directs users to City DRRMO, PNP (117), BFP, Red Cross, and James Gordon Hospital
- Powered by **OpenAI via the AI SDK**

### 🔐 User Authentication
- Role-based accounts: **Citizen, Volunteer, LGU, Admin**
- Secure cookie-based sessions with `sha256` hashing
- Bcrypt password hashing + brute-force protection (5 failed attempts → 15-min lock)
- Barangay-level user profiles

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 16 (App Router) | React framework |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| Framer Motion | Animations |
| Radix UI + shadcn/ui | UI components |
| Leaflet / React Leaflet | Interactive maps |
| Recharts | Data visualizations |
| React Hook Form + Zod | Form validation |
| SWR | Data fetching |
| AI SDK | KlimaBot chatbot |

### Backend
| Technology | Purpose |
|---|---|
| PHP 8.1+ | REST API |
| MySQL 5.7+ / MariaDB 10.4+ | Database |
| XAMPP / LAMP | Local development server |
| PDO (Prepared Statements) | SQL injection protection |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and **pnpm**
- **XAMPP** (Apache + MySQL) for the PHP backend
- A modern web browser

---

### ⚙️ Backend Setup (PHP/MySQL)

1. Start **Apache** and **MySQL** in the XAMPP control panel.

2. Open **phpMyAdmin** (`http://localhost/phpmyadmin`) and import the SQL files **in order**:
   ```
   scripts/001_create_users_and_sessions.sql
   scripts/002_create_reports.sql
   scripts/003_create_evac_centers.sql
   scripts/004_seed_sample_data.sql   ← dev/demo data only
   ```

3. Copy the `php-backend/` folder into your XAMPP htdocs:
   ```
   C:\xampp\htdocs\klimalert-api\
   ```

4. Edit `php-backend/config.php` with your MySQL credentials.

5. Verify the backend is running:
   ```
   http://localhost/klimalert-api/auth/me.php
   ```
   Expected response: `{"ok":false,"error":"Not authenticated."}`

---

### 💻 Frontend Setup (Next.js)

1. **Clone the repository**
   ```bash
   git clone https://github.com/chris-lazatin/KlimAlert-PH.git
   cd KlimAlert-PH
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables** — create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost/klimalert-api
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
KlimAlert-PH/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── register/       # Registration page
│   ├── api/
│   │   └── klimabot/       # KlimaBot AI API route
│   ├── dashboard/
│   │   ├── page.tsx        # Main dashboard (alerts, stats, map)
│   │   ├── evacuation/     # Evacuation center map & list
│   │   ├── guides/         # Bilingual preparedness guides
│   │   └── reports/        # Hazard report feed
│   └── page.tsx            # Landing page
├── components/
│   ├── auth/               # Auth shell layout
│   ├── dashboard/          # Dashboard components (map, sidebar, topbar)
│   ├── klimabot/           # Floating chatbot widget
│   ├── sections/           # Landing page sections
│   └── ui/                 # Reusable shadcn/ui components
├── lib/
│   ├── api.ts              # Typed PHP API client
│   ├── auth-context.tsx    # Authentication context
│   ├── evacuation-centers.ts # Evac center data & types
│   ├── hazard-reports.ts   # Hazard report types & mock data
│   ├── preparedness-guides.ts # Bilingual guide content
│   └── olongapo.ts         # Olongapo barangay data
├── php-backend/
│   ├── auth/               # Login, register, logout, session
│   ├── reports/            # Create & list hazard reports
│   ├── evac/               # Evacuation center endpoint
│   └── lib/                # Helpers & session management
├── scripts/
│   ├── 001_create_users_and_sessions.sql
│   ├── 002_create_reports.sql
│   ├── 003_create_evac_centers.sql
│   └── 004_seed_sample_data.sql
└── public/                 # Static assets & icons
```

---

## 🔐 Security

| Concern | Implementation |
|---|---|
| SQL Injection | PDO with prepared statements everywhere |
| Password Storage | `bcrypt` hash + auto-rehash |
| Session Security | `sha256(secret)` stored in DB; HttpOnly + SameSite cookies |
| Brute Force | 5 failed logins → 15-min account lock |
| File Uploads | MIME sniff + extension whitelist + 5MB cap + random filename |
| XSS | All responses are `application/json` with `nosniff` headers |

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register.php` | Register a new user |
| POST | `/auth/login.php` | Login and create session |
| POST | `/auth/logout.php` | Destroy session |
| GET | `/auth/me.php` | Get current authenticated user |
| POST | `/reports/create.php` | Submit a hazard report (multipart) |
| GET | `/reports/list.php` | Get hazard report feed |
| GET | `/evac/list.php` | Get available evacuation centers only |

---

## 📋 Roadmap

- [x] Bilingual preparedness guides (EN / FIL)
- [x] Interactive evacuation map with real-time capacity
- [x] Community hazard reporting with photo upload
- [x] KlimaBot AI assistant
- [x] Role-based authentication (Citizen / Volunteer / LGU / Admin)
- [x] PHP/MySQL REST backend with security hardening
- [ ] Push notifications for active alerts
- [ ] Offline mode / PWA support
- [ ] Full admin panel for LGU officers
- [ ] SMS alerts integration

---

## 🙏 Acknowledgements

- [PAGASA](https://www.pagasa.dost.gov.ph/) — Weather data & typhoon signal references
- [NDRRMC](https://www.ndrrmc.gov.ph/) — Disaster preparedness guidelines
- [PHIVOLCS](https://www.phivolcs.dost.gov.ph/) — Earthquake & volcanic activity data
- [Philippine Red Cross](https://www.redcross.org.ph/) — Emergency response guidance
- [City DRRMO Olongapo](https://olongapo.gov.ph/) — Local disaster risk data
- Gordon College, Olongapo City — Capstone support

---

## 📜 License

This project is licensed under the **MIT License**.

---

> *KlimAlert PH — Keeping Filipino communities informed and prepared.* 🇵🇭
