import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Search, ShieldCheck, WalletCards } from "lucide-react";

export default function Home() {
  return (
    <>
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-700 text-white">
        <div className="container-app grid gap-10 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="rounded-full bg-white/15 px-3 py-1 text-sm">Trusted freelance marketplace</span>
            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">Find the right talent. Get great work done.</h1>
            <p className="mt-5 max-w-xl text-lg text-blue-100">Hire skilled freelancers or sell your expertise with secure contracts, milestone payments and reviews.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn bg-white text-brand-700 hover:bg-blue-50" to="/services">Find freelancers <ArrowRight size={18}/></Link>
              <Link className="btn bg-white/10 text-white hover:bg-white/20" to="/jobs">Browse jobs</Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              [Search, "Smart discovery", "Search by skills, rating, budget and category."],
              [ShieldCheck, "Safer contracts", "Manage milestones and project progress in one place."],
              [WalletCards, "Secure payments", "Use Stripe-powered checkout for milestone payments."]
            ].map(([Icon, title, text]) => (
              <div key={title} className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                <Icon />
                <h3 className="mt-3 font-bold">{title}</h3>
                <p className="mt-1 text-sm text-blue-100">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-app py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["For freelancers", ["Create services", "Showcase portfolio", "Apply to jobs", "Get milestone payments"]],
            ["For clients", ["Post jobs", "Compare talent", "Create contracts", "Review freelancers"]],
            ["Built for clarity", ["Notifications", "Transaction history", "Ratings & reviews", "Role-based dashboards"]]
          ].map(([title, items]) => (
            <div className="card" key={title}>
              <h2 className="text-xl font-bold">{title}</h2>
              <ul className="mt-4 space-y-3 text-slate-600">{items.map(x => <li key={x} className="flex gap-2"><CheckCircle2 className="text-green-600" size={20}/>{x}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
