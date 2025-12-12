# ZENCODZY - Digital Agency Platform
> **Advanced High-Performance Website for Modern Digital Solutions**

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg) ![Status](https://img.shields.io/badge/status-production--ready-success.svg) ![Security](https://img.shields.io/badge/security-hardened-secure.svg)

## 📖 Overview
**ZENCODZY** is a state-of-the-art digital agency website built with a focus on **zero-latency performance**, **pixel-perfect design fidelity**, and **robust security**. 

Starting from a high-fidelity visual design (Framer), this project has been engineered into a full-scale web application featuring a custom Node.js backend, serverless Redis database, and a highly optimized frontend architecture.

---

## 🚀 Key Features

### 🎨 Frontend Excellence
- **Ultra-Fast Loading:** Custom-built `ultra-fast-loader.js` provides instant visual feedback with session-aware behavior.
- **Smart Navigation:** `navigation-fix.js` implements an intelligent routing system that handles smooth scrolling for sections and instant transitions for pages.
- **Visual Fidelity:** 100% preservation of complex animations and layouts from the original Framer design.
- **Asset Optimization:** Automated lazy loading (`image-optimizer.js`) and localized font preloading.

### ⚙️ Backend Power
- **Secure API:** Express.js backend hardened with `Helmet`, `Rate-Limiting`, `HPP`, and `XSS-Clean`.
- **Serverless Storage:** Integration with **Upstash Redis** for blazing-fast, scalable form submissions.
- **Modular Architecture:** Clean separation of concerns (MVC pattern) for maintainabillity.

### 🛡️ Security First
- **Strict CORS:** Access locked down to specific frontend origins.
- **Input Sanitization:** All incoming data is rigorously validated and sanitized to prevent injection attacks.
- **DDoS Protection:** Rate limiting mitigates abuse and brute-force attempts.

---

## 🛠 Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | Vite, HTML5, Vanilla JS | Ultra-fast build tool and lightweight runtime. |
| **Backend** | Node.js, Express.js | Robust API server with secure middleware. |
| **Database** | Upstash Redis | Serverless Key-Value store for form data. |
| **Dev Tools** | Concurrently, Dotenv | Efficient development workflow. |

---

## 📂 Project Structure

```
zencodzy-website-code/
├── client/                     # Frontend Application
│   ├── pages/                  # HTML Pages (Projects, Quote, etc.)
│   ├── public/assets/js/       # Core Logic Scripts
│   │   ├── console-fix.js      # Dev: Suppresses harmless console noise
│   │   ├── form-handler.js     # Logic: Handles API form submissions
│   │   ├── framer-init-fix.js  # Dev: Fixes Framer CORS issues
│   │   ├── image-optimizer.js  # Perf: Lazy loading for images
│   │   ├── navigation-fix.js   # UX: Smart routing & smooth scrolling
│   │   └── ultra-fast-loader.js# UX: Instant branded loading screen
│   ├── vite.config.js          # Build Configuration (Proxy, HMR disabled)
│   └── index.html              # Main Entry Point
├── server/                     # Backend API (Node.js + Express)
│   ├── config/redis.js         # Database Connection
│   ├── controllers/            # Business Logic
│   ├── middleware/security.js  # Security Headers & Rate Limiting
│   ├── routes/api.js           # API Endpoints
│   └── index.js                # Server Entry Point
├── .env                        # Environment Variables (Secrets)
└── package.json                # Project Manifest
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Redis Credentials**: Upstash REST URL & Token

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Configuration
Create a `.env` file in the root directory:
```bash
# .env file
PORT=5000
UPSTASH_REDIS_REST_URL=your_url_here
UPSTASH_REDIS_REST_TOKEN=your_token_here
FRONTEND_URL=http://localhost:3000
```

### 3. Development
Run both client and server concurrently:
```bash
npm run dev
```
- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend:** [http://localhost:5000](http://localhost:5000)

### 4. Build for Production
Generate the optimized static build:
```bash
npm run build
```

---

## 📄 API Documentation

### POST `/api/submit-form`
Submits a contact or quote request.

**Body:**
```json
{
  "formType": "contact",
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello Zencodzy!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "data": { "id": "contact_17072..." }
}
```

---

## 🤝 Contributing
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

---

## 📝 License
This project is proprietary software belonging to **ZENCODZY**. All rights reserved.

---
*Built with precision by ZENCODZY Engineering Team.*