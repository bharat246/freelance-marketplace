import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import Stars from "../components/Stars";

export default function ServiceDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  useEffect(() => { api.get(`/services/${id}`).then(r=>setData(r.data)); }, [id]);
  if (!data) return <div className="container-app py-20">Loading...</div>;
  const { service, reviews } = data;
  return <div className="container-app py-10">
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="card">
        <span className="badge">{service.category}</span>
        <h1 className="mt-4 text-3xl font-black">{service.title}</h1>
        <p className="mt-4 whitespace-pre-wrap text-slate-600">{service.description}</p>
        <div className="mt-6 flex flex-wrap gap-2">{service.freelancer.skills?.map(x=><span className="badge" key={x}>{x}</span>)}</div>
        <h2 className="mt-10 text-xl font-bold">Portfolio</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">{service.freelancer.portfolio?.map(p=><div className="rounded-xl border p-4" key={p.title}><b>{p.title}</b><p className="text-sm text-slate-500">{p.description}</p>{p.url && <a className="text-brand-600" href={p.url} target="_blank">View work</a>}</div>)}</div>
      </div>
      <div>
        <div className="card sticky top-24">
          <p className="text-sm text-slate-500">Starting at</p><p className="text-4xl font-black">₹{service.price}</p>
          <p className="mt-2 text-sm">Delivery in {service.deliveryDays} days</p>
          <button className="btn-primary mt-6 w-full" onClick={()=>alert("Contact/contract creation is available from the client dashboard after hiring.")}>Request service</button>
          <div className="mt-6 flex items-center gap-2"><Stars value={service.freelancer.ratingAverage}/><b>{service.freelancer.ratingAverage || "New"}</b></div>
          <p className="mt-3 text-sm text-slate-600">{service.freelancer.bio}</p>
        </div>
      </div>
    </div>
    <section className="mt-8"><h2 className="text-2xl font-black">Reviews</h2><div className="mt-4 grid gap-4">{reviews.map(r=><div className="card" key={r._id}><div className="flex justify-between"><b>{r.client?.name}</b><Stars value={r.rating}/></div><p className="mt-2 text-slate-600">{r.comment}</p>{r.freelancerResponse && <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm"><b>Freelancer response:</b> {r.freelancerResponse}</div>}</div>)}</div></section>
  </div>;
}
