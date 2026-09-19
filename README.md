<div align="center">

# 🛍️ Nexora — Full-Stack E-Commerce Platform

**A production-style MERN e-commerce application with real payment processing, cloud image uploads, JWT authentication, and a complete admin system — built and deployed end to end.**

[![Live Demo](https://img.shields.io/badge/LIVE_DEMO-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://nexora-ecommerce-psi.vercel.app/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#tech-stack)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](#tech-stack)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](#tech-stack)

</div>

---

## Overview

Nexora is a full-stack e-commerce platform built with the MERN stack. It covers the complete commerce flow — product discovery with search and filtering, cart and wishlist, secure checkout with real Razorpay payment processing, and a role-protected admin dashboard for managing products, categories, orders, users, coupons and customer messages.

The frontend is a React 19 + Vite SPA styled with Tailwind CSS v4. The backend is an Express 5 REST API backed by MongoDB/Mongoose, with JWT-based authentication and Cloudinary-powered image uploads.

**Live demo:** [nexora-ecommerce-psi.vercel.app](https://nexora-ecommerce-psi.vercel.app/)
**Source:** this repository

---

## Screenshots

*(To be added — recommended screens: Home page, Shop/product listing with filters applied, Product details page, Cart, Checkout, Admin Dashboard with stats, Admin Products table.)*

---

## Key Features

**Storefront**
- Product browsing with **search** (name/description/brand), **category, price-range and "featured" filtering**, sorting and pagination
- Product details, image gallery
- Cart and Wishlist (persisted per authenticated user)
- Product reviews and star ratings
- Coupon / discount code redemption at checkout
- Multi-address management for shipping
- Full checkout → order flow, order history and order-status tracking

**Payments**
- **Razorpay integration** — order creation, HMAC-SHA256 payment-signature verification, payment capture, and automatic stock/cart rollback if a payment is cancelled or fails

**Authentication & Access Control**
- JWT-based register/login
- Role-based route protection (customer vs. admin) on both frontend (route guards) and backend (middleware)

**Admin Dashboard**
- Live stats: total users, products, orders, order-status breakdown, and **revenue aggregated directly from paid orders**
- Full CRUD for products, categories, coupons and users
- Order management (status updates)
- Customer contact-message inbox

**Media**
- Product image uploads handled server-side via **Cloudinary** (stream upload + delete)

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, React Router v7, Axios |
| **Backend** | Node.js, Express 5, MongoDB, Mongoose |
| **Auth** | JSON Web Tokens, bcryptjs |
| **Payments** | Razorpay (order creation + signature verification + capture) |
| **Media** | Cloudinary |
| **Deployment** | Vercel (frontend & backend) |

---

## Architecture

```
nexora-ecommerce/
├── client/              React 19 + Vite frontend
│   └── src/
│       ├── pages/       Storefront pages + Admin pages
│       ├── context/     Auth, Cart, Wishlist state
│       ├── routes/      Public / Private / Admin route guards
│       └── services/    Axios API layer (per resource)
└── server/               Express REST API
    └── src/
        ├── controllers/ Business logic per resource
        ├── models/      Mongoose schemas (10 models)
        ├── routes/      13 REST route groups
        ├── middlewares/ Auth, admin, upload, validation, errors
        └── config/      MongoDB, JWT, Cloudinary config
```

### Database models
`User` · `Product` · `Category` · `Cart` · `Wishlist` · `Order` · `Review` · `Coupon` · `Address` · `ContactMessage`

### API surface
`/api/auth` · `/api/users` · `/api/products` · `/api/categories` · `/api/uploads` · `/api/cart` · `/api/wishlist` · `/api/orders` · `/api/payments` · `/api/reviews` · `/api/coupons` · `/api/addresses` · `/api/dashboard` · `/api/contact`

---

## Getting Started

### Prerequisites
- Node.js and npm
- A MongoDB connection string (local or Atlas)
- A Cloudinary account (cloud name, API key, API secret)
- A Razorpay account (key ID, key secret) — test-mode keys work for local development

### Installation

```bash
git clone https://github.com/mr-faheem/nexora-ecommerce.git
cd nexora-ecommerce

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment variables

**`server/.env`**
```
PORT=
MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

**`client/.env`**
```
VITE_API_BASE_URL=
```

### Run locally

```bash
# Terminal 1 — start the API (defaults to http://localhost:5000)
cd server
npm run dev

# Terminal 2 — start the frontend (Vite dev server)
cd client
npm run dev
```

---

## Deployment

Both the client and server are deployed on **Vercel**.
Live app: **[nexora-ecommerce-psi.vercel.app](https://nexora-ecommerce-psi.vercel.app/)**

---

## Roadmap

- [ ] Automated tests (unit + integration)
- [ ] CI/CD pipeline for deployment checks
- [ ] Containerized local setup (Docker)
- [ ] API documentation (OpenAPI/Swagger)

---

## Author

**Mohd Faheem**
Full Stack Developer (MERN)

[Portfolio](https://mr-faheem.github.io/faheem.portfolio/) · [GitHub](https://github.com/mr-faheem) · [LinkedIn](https://www.linkedin.com/in/mohd-faheem-b8782726a/)