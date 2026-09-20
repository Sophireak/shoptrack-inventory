# ShopTrack — Chea Sim Primary School Uniform & Supplies POS & Inventory System
## ហាងឯកសណ្ឋានសិស្ស សម្តេចជាស៊ីម (Next.js 14 + React + Tailwind + Supabase)

A production-grade, full-stack web application built with **Next.js 14 (App Router)**, **React**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL)** for the official school uniform shop located **inside the campus of Samdech Chea Sim Primary School (បឋមសិក្សា សម្តេចជាស៊ីម)** in Phnom Penh, Cambodia.

[![Built with Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Supabase Database](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Telegram Bot Alerts](https://img.shields.io/badge/Telegram-Automated%20Alerts-229ED9?style=for-the-badge&logo=telegram)](https://telegram.org)

---

## 🎒 Real-World Cambodian School Context

- **Business Identity**: ហាងឯកសណ្ឋានសិស្ស សម្តេចជាស៊ីម (Chea Sim Primary School Uniforms & Supplies)
- **Campus Location**: ខាងក្នុងបរិវេណសាលាបឋមសិក្សា សម្តេចជាស៊ីម (On-campus counter in front of administration building)
- **Target Audience**: Parents of primary students (Grade 1 to 6 / ថ្នាក់ទី១ ដល់ ទី៦) purchasing official uniforms, sport sets, and school ID supplies.
- **Problem Solved**: Eliminates long queues at the school booth during back-to-school surges by letting parents pre-order online with KHQR Bakong, while cashiers manage real-time inventory and walk-in sales on the POS terminal.

---

## 👕 Official School Products Catalog (Exactly 7 Unified Cards)

| # | Item Name (Khmer) | Item Name (English) | Grade & Color / Sizing Matrix | Standard Price |
|---|---|---|---|:---:|
| **1** | **អាវសិស្សប្រុសដៃខ្លី ពណ៌ស** | Boy Student Shirt | Sizes: 20, 22, 24, 26, 28, 30, 32 | 18,000 ៛ (~$4.39) |
| **2** | **ខោខ្លីសិស្សប្រុស ពណ៌ខៀវចាស់** | Boy Student Pants | Sizes: 22, 24, 26, 28, 30, 32 | 16,000 ៛ (~$3.90) |
| **3** | **ក្រវ៉ាត់កសិស្សប្រុស (Tie)** | Boy Student Tie | Free Size | 6,000 ៛ (~$1.46) |
| **4** | **អាវសិស្សស្រីដៃខ្លី កឈូក ពណ៌ស** | Girl Student Shirt | Sizes: 20, 22, 24, 26, 28, 30, 32 | 18,000 ៛ (~$4.39) |
| **5** | **សំពត់ផ្នត់សិស្សស្រី ពណ៌ខៀវចាស់** | Girl Student Skirt | Sizes: 22, 24, 26, 28, 30, 32 | 16,000 ៛ (~$3.90) |
| **6** | **ឈុតកីឡាសាលា (អាវយឺត + ខោកីឡា)** | Unisex Sport Uniform Set | **Color by Grade**: 🔵 Grade 1-2 (Blue), 🟠 Grade 3-4 (Orange), 🟢 Grade 5-6 (Green)<br>Sizes: `20, 22, 24, 26, 28, 30, M, L, XL` | 26,000 ៛ (~$6.34) |
| **7** | **ប្រអប់កាតសិស្ស និងខ្សែពាក់ក** | School ID Card & Lanyard | **3 Package Options (All with Color by Grade)**:<br>• 📦 **១ ឈុត (1 Set)**: 6,500 ៛ (~$1.59)<br>• 🪪 **តែប្រអប់កាត (Holder Only)**: 1,500 ៛ (~$0.37)<br>• 🎗️ **តែខ្សែពាក់ក (Lanyard Only)**: 5,000 ៛ (~$1.22) | 6,500 / 1,500 / 5,000 ៛ |

---

## ⚡ Architecture & Tech Stack

```
shoptrack-inventory/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with Khmer font (Kantumruy Pro)
│   │   ├── globals.css        # Tailwind CSS directives & receipt print media
│   │   ├── page.tsx           # Parent Storefront (Grade Advisor, Catalog, Cart)
│   │   ├── admin/
│   │   │   └── page.tsx       # School Back-Office, Live POS & Order Tracker
│   │   └── api/
│   │       ├── inventory/route.ts # Real-time stock API
│   │       └── orders/route.ts    # Order creation & Telegram dispatch API
│   ├── components/
│   │   ├── Header.tsx         # Banner, location, contact, and cart indicator
│   │   ├── GradeAdvisor.tsx   # Grade 1-6 interactive selector & uniform checklist
│   │   ├── ProductGrid.tsx    # Category tabs & 7 unified product cards
│   │   ├── cards/
│   │   │   ├── StandardCard.tsx
│   │   │   ├── SportUniformCard.tsx # Grade color switcher & size pills
│   │   │   └── IdHolderCard.tsx     # 1 Set, Holder Only, Lanyard Only + Color
│   │   ├── CartDrawer.tsx     # Slide-over shopping cart drawer
│   │   ├── CheckoutModal.tsx  # Pickup/Delivery & Cash/KHQR checkout
│   │   ├── KhqrModal.tsx      # Bakong KHQR QR Code & deep link
│   │   └── admin/
│   │       ├── DashboardOverview.tsx # Revenue, orders, low-stock counters
│   │       ├── PosRegister.tsx       # Rapid touch cashier with thermal receipt
│   │       ├── InventoryManager.tsx  # Live stock calibration table
│   │       ├── OrderTracker.tsx      # Orders list with status manager
│   │       └── StoreSettings.tsx     # Store config (Name, Phones, Bakong ID)
│   ├── lib/
│   │   ├── catalog.ts         # Verified school catalog & variants
│   │   ├── supabase.ts        # Supabase PostgreSQL client + offline fallback
│   │   ├── telegram.ts        # Telegram bot alert formatter
│   │   └── khqr.ts            # Bakong KHQR generator
│   └── types/
│       └── index.ts           # Strict TypeScript interfaces
└── supabase/
    └── schema.sql             # Complete PostgreSQL schema, RLS, and seed data
```

---

## 🚀 Getting Started Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Sophireak/shoptrack-inventory.git
   cd shoptrack-inventory
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) for the Parent Storefront.  
   Open [http://localhost:3000/admin](http://localhost:3000/admin) for the School POS & Admin Dashboard.

4. **Production build**:
   ```bash
   npm run build
   npm start
   ```

---

## 🗄️ Setting Up Supabase (Optional)

The application works out-of-the-box in local offline mode using bundled seed data and `localStorage`. To connect a live Supabase PostgreSQL database:

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard and run the script in [`supabase/schema.sql`](supabase/schema.sql).
3. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
4. Fill in your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## 📄 License
MIT © Sophireak (@bNha_dev)
