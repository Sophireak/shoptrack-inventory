# ShopTrack — Chea Sim Primary School Uniform & Supplies POS & Inventory System
## ហាងឯកសណ្ឋានសិស្ស សម្តេចជាស៊ីម (On-Campus Booth POS & Parent Online Store)

A modern, mobile-first dual-application built for the official school uniform shop located **inside the campus of Samdech Chea Sim Primary School (បឋមសិក្សា សម្តេចជាស៊ីម)** in Cambodia.

[![Live Web Store](https://img.shields.io/badge/Storefront-Live-blue?style=for-the-badge&logo=vercel)](/)
[![Staff POS Dashboard](https://img.shields.io/badge/Staff%20POS-Dashboard-emerald?style=for-the-badge&logo=shield)](/admin)
[![Telegram Integration](https://img.shields.io/badge/Telegram-Automated%20Alerts-229ED9?style=for-the-badge&logo=telegram)](https://telegram.org)

---

## 🎒 Real-World Cambodian School Context

- **Business Identity**: ហាងឯកសណ្ឋានសិស្ស សម្តេចជាស៊ីម (Chea Sim Primary School Uniforms & Supplies)
- **Campus Location**: ខាងក្នុងបរិវេណសាលាបឋមសិក្សា សម្តេចជាស៊ីម (On-campus counter in front of administration building)
- **Target Audience**: Parents of primary students (Grade 1 to 6 / ថ្នាក់ទី១ ដល់ ទី៦) purchasing official uniforms, sport sets, and school ID supplies.
- **Problem Solved**: Eliminates long queues at the school booth during back-to-school surges by letting parents pre-order online, pay with Bakong KHQR, and pick up pre-bagged uniforms directly at the school counter in 15 minutes.

---

## 👕 Official School Products & Grade Sport Color Sets

| # | Item Name (Khmer) | Item Name (English) | Grade & Color / Sizing Matrix | Standard Price |
|---|---|---|---|---|
| **1** | **អាវសិស្សប្រុស (សាច់ក្រណាត់ស)** | Boy Student Shirt | Size 24, 26, 28, 30, 32, 34 | 18,000 ៛ (~$4.39) |
| **2** | **ខោខ្លីសិស្សប្រុស (ពណ៌ខៀវចាស់)** | Boy Student Pants | Size 22, 24, 26, 28, 30, 32 | 20,000 ៛ (~$4.88) |
| **3** | **ក្រវ៉ាត់កសិស្សប្រុស (មានកៅស៊ូយឺត)** | Boy Student Tie | Free Size (Grade 1–6) | 5,000 ៛ (~$1.22) |
| **4** | **អាវសិស្សស្រី (សាច់ក្រណាត់ស កបត់)** | Girl Student Shirt | Size 24, 26, 28, 30, 32, 34 | 18,000 ៛ (~$4.39) |
| **5** | **សំពត់សិស្សស្រី (ពណ៌ខៀវចាស់ មានផ្នត់)** | Girl Student Skirt | Size 22, 24, 26, 28, 30, 32 | 20,000 ៛ (~$4.88) |
| **6a** | **ឈុតកីឡាសាលា ពណ៌ខៀវ (ថ្នាក់ទី១ - ទី២)** | Sport Uniform Set - Blue | **Grade 1–2 (Blue)**: 20, 22, 24, 26, 28, 30, M, L, XL | 26,000 ៛ (~$6.34) |
| **6b** | **ឈុតកីឡាសាលា ពណ៌ទឹកក្រូច (ថ្នាក់ទី៣ - ទី៤)** | Sport Uniform Set - Orange | **Grade 3–4 (Orange)**: 20, 22, 24, 26, 28, 30, M, L, XL | 26,000 ៛ (~$6.34) |
| **6c** | **ឈុតកីឡាសាលា ពណ៌បៃតង (ថ្នាក់ទី៥ - ទី៦)** | Sport Uniform Set - Green | **Grade 5–6 (Green)**: 20, 22, 24, 26, 28, 30, M, L, XL | 26,000 ៛ (~$6.34) |
| **7** | **ប្រអប់កាតសិស្ស និងខ្សែពាក់ក** | ID Card Holder & Lanyard | Blue Cord / Red Cord | 4,000 ៛ (~$0.98) |

---

## ⚡ Core Technical Features

### 1. Parent Online Storefront (`index.html`)
- **Smart Grade-to-Size Advisor**: Interactive selector for Grades 1–6 (ថ្នាក់ទី១ ដល់ ទី៦) automatically recommending chest and waist sizes.
- **Dual Currency Pricing**: Primary pricing in Khmer Riel (៛) with live USD ($) equivalent (Standard 4,100 KHR = $1).
- **Fulfillment Choice**:
  - 🏫 **On-Campus Booth Pickup (ទទួលនៅបញ្ជរក្នុងបរិវេណសាលា)** (Free, ready in 15 mins).
  - 🛵 **Home Delivery in Town (ដឹកជញ្ជូនដល់ផ្ទះ)** (+4,000 ៛).
- **Instant KHQR Bakong QR Code**: Generates dynamic scan-to-pay QR code compatible with ABA Mobile, ACLEDA, Wing, Canadia, Sathapana, etc.
- **Real-Time Telegram Order Alert**: Serverless API dispatches order breakdown to shop staff Telegram group.
- **Order Tracking**: Lookup status by phone number or Order ID (`CS-XXXX`).

### 2. Staff POS & Inventory Back-Office (`admin.html`)
- **Passcode Protection**: Secure booth staff access (`cheasim2026`).
- **Fast Walk-in POS Register**: High-speed touch checkout for walk-in morning rush. Calculates cash change and decrements stock per size instantly.
- **Size-Level Inventory Matrix**: Visual breakdown of stock per size with low-stock warnings (⚠️ < 5 units).
- **Stock Restock Modal**: 1-click batch stock replenishment (+10, +20, +50 units) with supplier notes.
- **Online Order Fulfillment Queue**: Real-time management of pre-ordered uniforms awaiting pickup.
- **1-Click Telegram End-of-Day (EOD) Report**: Dispatches full daily financial audit (Riel/USD totals, cash vs KHQR breakdown, top items) to the owner's Telegram.

---

## 🏗 Architecture & Stack

```
shoptrack-inventory/
├── index.html              # Parent Online Storefront (Tailwind, Lucide, KHQR)
├── admin.html              # School Shop Owner POS & Inventory Dashboard
├── api/
│   ├── orders.js           # Serverless API: Orders & Telegram dispatch
│   └── telegram-report.js  # Serverless API: End-of-day sales report
├── vercel.json             # Vercel Serverless routing & rewrites
├── package.json            # Project manifest
└── README.md               # Case study documentation
```

- **Frontend**: HTML5, Tailwind CSS, Lucide Icons, Kantumruy Pro & Plus Jakarta Sans fonts.
- **Backend**: Node.js Serverless Functions (`api/*.js`) deployed on Vercel ($0/month tier).
- **Payment**: Bakong KHQR (National Bank of Cambodia standard).
- **Alerts**: Telegram Bot API via native HTTPS.

---

## 🚀 Deployment

### Local Testing
```bash
npx serve .
# Open http://localhost:3000 for Storefront
# Open http://localhost:3000/admin for POS Dashboard
```

### Vercel Deployment
```bash
vercel --prod
```

---

## 👨‍💻 Developer
Developed with pride by **Sophireak (@bNha_dev)** for Cambodian educational & retail automation.
