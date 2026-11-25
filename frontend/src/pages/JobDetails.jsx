import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ coverLetter: "", proposedPrice: "", deliveryDays: "" });
  const [message, setMessage] = useState("");

  async function load() { const { data } = await api.get(`/jobs/${id}`); setData(data); }
  useEffect(()=>{load()},[id]);

  async function apply(e) {
    e.preventDefault();
    try { await api.post(`/jobs/${id}/apply`, form); setMessage("Application submitted successfully."); }
    catch(e) { setMessage(e.response?.data?.message || "Application failed"); }
  }

  if (!data) return <div className="container-app py-20">Loading...</div>;
  const { job, applications } = data;

  return <div className="container-app py-10">
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <article className="card">
        <span className="badge">{job.category}</span><h1 className="mt-3 text-3xl font-black">{job.title}</h1>
        <p className="mt-5 whitespace-pre-wrap text-slate-600">{job.description}</p>
        <div className="mt-6 flex flex-wrap gap-2">{job.skills?.map(s=><span className="badge" key={s}>{s}</span>)}</div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3"><div><small>Budget</small><b className="block">₹{job.budgetMin || 0} - ₹{job.budgetMax || "Negotiable"}</b></div><div><small>Deadline</small><b className="block">{job.deadline ? new Date(job.deadline).toLocaleDateString() : "Flexible"}</b></div><div><small>Location</small><b className="block">{job.location || "Remote"}</b></div></div>
      </article>
      {user?.role === "freelancer" && job.status === "open" && <form className="card" onSubmit={apply}><h2 className="text-xl font-bold">Apply for this job</h2>{message && <p className="mt-3 rounded-xl bg-slate-100 p-3 text-sm">{message}</p>}<label className="label mt-5">Cover letter</label><textarea className="input min-h-32" required value={form.coverLetter} onChange={e=>setForm({...form,coverLetter:e.target.value})}/><label className="label mt-4">Proposed price</label><input className="input" type="number" required value={form.proposedPrice} onChange={e=>setForm({...form,proposedPrice:e.target.value})}/><label className="label mt-4">Delivery days</label><input className="input" type="number" required value={form.deliveryDays} onChange={e=>setForm({...form,deliveryDays:e.target.value})}/><button className="btn-primary mt-5 w-full">Submit application</button></form>}
    </div>
    {user?.role === "client" && <section className="mt-8"><h2 className="text-2xl font-black">Applications ({applications.length})</h2><div className="mt-4 grid gap-4">{applications.map(a=><div className="card" key={a._id}><div className="flex items-center justify-between"><b>{a.freelancer.name}</b><span className="badge">{a.status}</span></div><p className="mt-3 text-slate-600">{a.coverLetter}</p><div className="mt-3 text-sm">Proposed: ₹{a.proposedPrice} • {a.deliveryDays} days</div></div>)}</div></section>}
  </div>;
}
