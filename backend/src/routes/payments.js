import express from "express";
import Stripe from "stripe";
import Contract from "../models/Contract.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import { protect, allowRoles } from "../middleware/auth.js";
import { notify } from "../utils/notify.js";

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

function requireStripe(res) {
  if (!stripe) {
    res.status(503).json({ message: "Stripe is not configured. Add STRIPE_SECRET_KEY to backend/.env" });
    return false;
  }
  return true;
}

router.post("/connect/onboard", protect, allowRoles("freelancer"), async (req, res) => {
  if (!requireStripe(res)) return;

  let accountId = req.user.stripeAccountId;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: process.env.STRIPE_COUNTRY || "IN",
      email: req.user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      }
    });
    accountId = account.id;
    req.user.stripeAccountId = accountId;
    await req.user.save();
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.CLIENT_URL}/dashboard?stripe=refresh`,
    return_url: `${process.env.CLIENT_URL}/dashboard?stripe=success`,
    type: "account_onboarding"
  });

  res.json({ url: link.url });
});

router.get("/connect/status", protect, allowRoles("freelancer"), async (req, res) => {
  if (!requireStripe(res)) return;
  if (!req.user.stripeAccountId) return res.json({ connected: false });

  const account = await stripe.accounts.retrieve(req.user.stripeAccountId);
  const complete = !!account.details_submitted;
  req.user.stripeOnboardingComplete = complete;
  await req.user.save();

  res.json({
    connected: true,
    complete,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled
  });
});

router.post("/checkout", protect, allowRoles("client"), async (req, res) => {
  if (!requireStripe(res)) return;

  const { contractId, milestoneId } = req.body;
  const contract = await Contract.findOne({ _id: contractId, client: req.user._id }).populate("freelancer");

  if (!contract) return res.status(404).json({ message: "Contract not found" });
  const milestone = contract.milestones.id(milestoneId);
  if (!milestone) return res.status(404).json({ message: "Milestone not found" });
  if (["paid", "cancelled"].includes(milestone.status)) return res.status(400).json({ message: "Milestone cannot be paid" });

  const freelancer = await User.findById(contract.freelancer._id);
  if (!freelancer?.stripeAccountId || !freelancer.stripeOnboardingComplete) {
    return res.status(400).json({ message: "Freelancer has not completed Stripe onboarding" });
  }

  const currency = process.env.STRIPE_CURRENCY || "inr";
  const amount = Math.round(Number(milestone.amount) * 100);

  const transaction = await Transaction.create({
    client: req.user._id,
    freelancer: freelancer._id,
    contract: contract._id,
    milestoneId: milestone._id.toString(),
    amount: Number(milestone.amount),
    currency,
    status: "pending"
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{
      price_data: {
        currency,
        product_data: {
          name: `${contract.title} — ${milestone.title}`,
          description: milestone.description || "Freelance project milestone"
        },
        unit_amount: amount
      },
      quantity: 1
    }],
    success_url: `${process.env.CLIENT_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/contracts/${contract._id}`,
    metadata: {
      transactionId: transaction._id.toString(),
      contractId: contract._id.toString(),
      milestoneId: milestone._id.toString()
    },
    payment_intent_data: {
      transfer_data: { destination: freelancer.stripeAccountId }
    }
  });

  transaction.stripeSessionId = session.id;
  await transaction.save();

  milestone.status = "funded";
  await contract.save();

  res.json({ url: session.url });
});

router.get("/transactions", protect, async (req, res) => {
  const filter = req.user.role === "client"
    ? { client: req.user._id }
    : { freelancer: req.user._id };

  const transactions = await Transaction.find(filter)
    .populate("contract", "title")
    .sort("-createdAt");

  res.json({ transactions });
});

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  if (!stripe) return res.sendStatus(200);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const transactionId = session.metadata?.transactionId;

    if (transactionId) {
      const tx = await Transaction.findById(transactionId);
      if (tx) {
        tx.status = "paid";
        tx.stripePaymentIntentId = session.payment_intent;
        await tx.save();

        const contract = await Contract.findById(tx.contract);
        if (contract) {
          const milestone = contract.milestones.id(tx.milestoneId);
          if (milestone) {
            milestone.status = "paid";
            milestone.paymentId = session.payment_intent;
            milestone.paidAt = new Date();
            await contract.save();
            await notify(tx.freelancer, "Payment received", `Payment received for ${milestone.title}.`, "payment", `/contracts/${contract._id}`);
          }
        }
      }
    }
  }

  res.json({ received: true });
});

export default router;
