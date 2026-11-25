import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import Stars from "../components/Stars";

export default function Services() {
  const [services, setServices] = useState([]);
  const [filters, setFilters] = useState({ q: "", category: "", minPrice: "", maxPrice: "" });

  async function load() {
    const { data } = await api.get("/services", { params: filters });
    setServices(data.services);
  }
  useEffect(() => { load(); }, []);

  return <div className="container-app py-10">
    <div className="mb-8"><h1 className="text-3xl font-black">Find freelance services</h1><p className="text-slate-500">Discover experts by skill, category and budget.</p></div>
    <div className="card grid gap-3 md:grid-cols-4">
      <input className="input" placeholder="Search..." value={filters.q} onChange={e=>setFilters({...filters,q:e.target.value})}/>
      <input className="input" placeholder="Category" value={filters.category} onChange={e=>setFilters({...filters,category:e.target.value})}/>
      <input className="input" type="number" placeholder="Min price" value={filters.minPrice} onChange={e=>setFilters({...filters,minPrice:e.target.value})}/>
      <div className="flex gap-2"><input className="input" type="number" placeholder="Max price" value={filters.maxPrice} onChange={e=>setFilters({...filters,maxPrice:e.target.value})}/><button className="btn-primary" onClick={load}>Search</button></div>
    </div>
    <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {services.map(s => <Link to={`/services/${s._id}`} className="card hover:-translate-y-0.5 hover:shadow-md" key={s._id}>
        <div className="flex items-center gap-3">{s.freelancer.avatar ? <img src={s.freelancer.avatar} className="h-11 w-11 rounded-full object-cover"/> : <div className="h-11 w-11 rounded-full bg-brand-100"/>}<div><p className="font-bold">{s.freelancer.name}</p><p className="text-xs text-slate-500">{s.freelancer.location || "Remote"}</p></div></div>
        <h2 className="mt-5 font-bold">{s.title}</h2><p className="mt-2 line-clamp-2 text-sm text-slate-600">{s.description}</p>
        <div className="mt-4 flex items-center justify-between"><span className="badge">{s.category}</span><span className="font-black">₹{s.price}</span></div>
        <div className="mt-2 flex items-center gap-2 text-sm"><Stars value={s.freelancer.ratingAverage}/><span>{s.freelancer.ratingAverage || "New"} ({s.freelancer.ratingCount || 0})</span></div>
      </Link>)}
    </div>
    {!services.length && <div className="py-20 text-center text-slate-500">No services found.</div>}
  </div>;
}
