import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ q: "", category: "", skill: "" });
  async function load() { const { data } = await api.get("/jobs", { params: filters }); setJobs(data.jobs); }
  useEffect(()=>{load()},[]);
  return <div className="container-app py-10">
    <h1 className="text-3xl font-black">Browse jobs</h1>
    <p className="mt-1 text-slate-500">Find projects that match your expertise.</p>
    <div className="card mt-6 grid gap-3 md:grid-cols-4">
      <input className="input" placeholder="Search jobs" value={filters.q} onChange={e=>setFilters({...filters,q:e.target.value})}/>
      <input className="input" placeholder="Category" value={filters.category} onChange={e=>setFilters({...filters,category:e.target.value})}/>
      <input className="input" placeholder="Skill" value={filters.skill} onChange={e=>setFilters({...filters,skill:e.target.value})}/>
      <button className="btn-primary" onClick={load}>Search</button>
    </div>
    <div className="mt-6 space-y-4">{jobs.map(j=><Link className="card block hover:shadow-md" to={`/jobs/${j._id}`} key={j._id}>
      <div className="flex flex-wrap items-start justify-between gap-4"><div><span className="badge">{j.category}</span><h2 className="mt-2 text-xl font-bold">{j.title}</h2></div><div className="text-right font-bold">₹{j.budgetMin || 0} - ₹{j.budgetMax || "Negotiable"}</div></div>
      <p className="mt-3 line-clamp-2 text-slate-600">{j.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">{j.skills?.map(s=><span className="badge" key={s}>{s}</span>)}</div>
      <div className="mt-4 text-sm text-slate-500">Posted by {j.client?.name} • {j.location || "Remote"}</div>
    </Link>)}</div>
  </div>;
}
