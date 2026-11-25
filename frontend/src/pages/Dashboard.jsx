import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Stars from "../components/Stars";

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [services, setServices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const c = await api.get("/contracts"); setContracts(c.data.contracts);
    const t = await api.get("/payments/transactions"); setTransactions(t.data.transactions);
    if (user.role === "freelancer") {
      const s = await api.get("/services"); setServices(s.data.services.filter(x=>x.freelancer?._id===user._id));
    } else {
      const j = await api.get("/jobs/mine"); setJobs(j.data.jobs);
    }
  }
  useEffect(()=>{load()},[user.role]);

  async function connectStripe() {
    try { const { data } = await api.post("/payments/connect/onboard"); window.location.href = data.url; }
    catch(e) { setMsg(e.response?.data?.message || "Stripe onboarding failed"); }
  }

  async function saveProfile(e) {
    e.preventDefault();
    const { data } = await api.put("/auth/profile", {
      name: e.target.name.value, bio: e.target.bio.value, location: e.target.location.value,
      skills: e.target.skills.value.split(",").map(s=>s.trim()).filter(Boolean),
      businessName: e.target.businessName?.value,
      businessDescription: e.target.businessDescription?.value
    });
    setUser(data.user); setMsg("Profile updated.");
  }

  return <div className="container-app py-10">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-3xl font-black">Dashboard</h1><p className="text-slate-500">Welcome, {user.name}.</p></div>
      {user.role === "freelancer" && <button className="btn-primary" onClick={connectStripe}>Connect Stripe</button>}
      {user.role === "client" && <Link className="btn-primary" to="/create-job">Post a job</Link>}
    </div>
    {msg && <div className="mt-4 rounded-xl bg-green-50 p-3 text-green-700">{msg}</div>}

    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <div className="card"><p className="text-sm text-slate-500">Contracts</p><p className="text-3xl font-black">{contracts.length}</p></div>
      <div className="card"><p className="text-sm text-slate-500">Transactions</p><p className="text-3xl font-black">{transactions.length}</p></div>
      <div className="card"><p className="text-sm text-slate-500">Rating</p><div className="text-xl"><Stars value={user.ratingAverage}/><span className="ml-2 font-bold">{user.ratingAverage || "New"}</span></div></div>
    </div>

    <form onSubmit={saveProfile} className="card mt-6">
      <h2 className="text-xl font-bold">Profile management</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div><label className="label">Name</label><input name="name" className="input" defaultValue={user.name}/></div>
        <div><label className="label">Location</label><input name="location" className="input" defaultValue={user.location || ""}/></div>
        <div className="md:col-span-2"><label className="label">Bio</label><textarea name="bio" className="input" defaultValue={user.bio || ""}/></div>
        <div><label className="label">Skills (comma separated)</label><input name="skills" className="input" defaultValue={user.skills?.join(", ") || ""}/></div>
        {user.role === "client" && <><div><label className="label">Business name</label><input name="businessName" className="input" defaultValue={user.businessName || ""}/></div><div className="md:col-span-2"><label className="label">Business description</label><textarea name="businessDescription" className="input" defaultValue={user.businessDescription || ""}/></div></>}
      </div>
      <button className="btn-primary mt-5">Save profile</button>
    </form>

    {user.role === "freelancer" ? <section className="mt-8">
      <div className="flex justify-between"><h2 className="text-2xl font-black">My services</h2><Link to="/create-service" className="btn-secondary">Create service</Link></div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{services.map(s=><div className="card" key={s._id}><h3 className="font-bold">{s.title}</h3><p className="mt-1 text-sm text-slate-500">₹{s.price} • {s.deliveryDays} days</p><Link className="mt-3 inline-block text-brand-600" to={`/services/${s._id}`}>View</Link></div>)}</div>
    </section> : <section className="mt-8">
      <div className="flex justify-between"><h2 className="text-2xl font-black">My jobs</h2><Link to="/create-job" className="btn-secondary">Create job</Link></div>
      <div className="mt-4 grid gap-4">{jobs.map(j=><Link className="card" to={`/jobs/${j._id}`} key={j._id}><h3 className="font-bold">{j.title}</h3><p className="text-sm text-slate-500">{j.status} • ₹{j.budgetMin || 0} - ₹{j.budgetMax || "Negotiable"}</p></Link>)}</div>
    </section>}

    <section className="mt-8"><h2 className="text-2xl font-black">Recent contracts</h2><div className="mt-4 grid gap-4">{contracts.map(c=><Link to={`/contracts/${c._id}`} className="card" key={c._id}><div className="flex justify-between"><b>{c.title}</b><span className="badge">{c.status}</span></div><p className="mt-2 text-sm text-slate-500">₹{c.totalAmount} • {c.milestones.length} milestones</p></Link>)}</div></section>
  </div>;
}
