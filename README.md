# Freelance Marketplace — MERN + TailwindCSS + Stripe

A full-stack freelance marketplace with:
- JWT email/password authentication
- Google OAuth
- Freelancer/client roles
- Freelancer profiles, skills, portfolio and services
- Client job listings and applications
- Search/filter freelancers and jobs
- Contracts and milestones
- Stripe Checkout + Stripe Connect onboarding
- Payment/transaction history
- Reviews and freelancer replies
- Notifications
- Separate React frontend and Express backend

## Requirements
- Node.js 20+
- MongoDB 7+ (local or MongoDB Atlas)
- Stripe account
- Google OAuth credentials (optional; email/password works without Google)

## 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs on `http://localhost:5000`.

## 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Stripe webhook

For local development, install Stripe CLI and run:

```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

Put the shown webhook secret in `STRIPE_WEBHOOK_SECRET`.

## Stripe Connect

Freelancers can click "Connect Stripe" from their dashboard. The backend creates a Stripe Express connected account and onboarding link.

For production:
- use HTTPS
- set real production URLs
- verify Stripe webhook signatures
- configure your Stripe platform properly
- add moderation, dispute handling, KYC/AML and legal terms before launch

## Notes

This project is designed as a strong working MVP. "Escrow" is represented by milestone payment authorization/checkout and contract milestone states; true regulated escrow should be implemented with a legally compliant payment/marketplace arrangement.
