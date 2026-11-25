import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function ContractDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [contract,setContract]=useState(null);
  const [review,setReview]=useState({rating:5,comment:""});
  const [msg,setMsg]=useState("");
  async function load(){const {data}=await api.get(`/contracts/${id}`);setContract(data.contract)}
  useEffect(()=>{load()},[id]);

  async function milestone(id,status){try{const {data}=await api.patch(`/contracts/${contract._id}/milestones/${id}`,{status});setContract(data.contract)}catch(e){setMsg(e.response?.data?.message||"Update failed")}}
  async function pay(milestoneId){try{const {data}=await api.post("/payments/checkout",{contractId:id,milestoneId});window.location.href=data.url}catch(e){setMsg(e.response?.data?.message||"Payment failed")}}
  async function complete(){const {data}=await api.post(`/contracts/${id}/complete`);setContract(data.contract)}
  async function submitReview(e){e.preventDefault();try{await api.post("/reviews",{contractId:id,...review});setMsg("Review submitted.");}catch(e){setMsg(e.response?.data?.message||"Review failed")}}

  if(!contract)return <div className="container-app py-20">Loading...</div>;
  return <div className="container-app py-10 max-w-5xl">
    <div className="card"><div className="flex flex-wrap justify-between gap-3"><div><span className="badge">{contract.status}</span><h1 className="mt-2 text-3xl font-black">{contract.title}</h1></div><b className="text-2xl">₹{contract.totalAmount}</b></div><p className="mt-4 text-slate-600">{contract.description}</p></div>
    {msg&&<div className="mt-4 rounded-xl bg-slate-100 p-3">{msg}</div>}
    <section className="mt-6"><h2 className="text-2xl font-black">Milestones</h2><div className="mt-4 space-y-4">{contract.milestones.map(m=><div className="card" key={m._id}><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-bold">{m.title}</h3><p className="text-sm text-slate-500">{m.description}</p></div><b>₹{m.amount}</b></div><div className="mt-4 flex flex-wrap items-center gap-2"><span className="badge">{m.status}</span>{user.role==="client"&&["pending","submitted"].includes(m.status)&&<button className="btn-secondary" onClick={()=>milestone(m._id,"approved")}>Approve</button>}{user.role==="client"&&["pending","approved"].includes(m.status)&&m.status!=="paid"&&<button className="btn-primary" onClick={()=>pay(m._id)}>Pay milestone</button>}{user.role==="freelancer"&&m.status==="funded"&&<button className="btn-primary" onClick={()=>milestone(m._id,"submitted")}>Submit work</button>}</div></div>)}</div></section>
    {user.role==="client"&&contract.status!=="completed"&&<button className="btn-primary mt-6" onClick={complete}>Mark contract completed</button>}
    {user.role==="client"&&contract.status==="completed"&&<form className="card mt-8" onSubmit={submitReview}><h2 className="text-xl font-bold">Leave a review</h2><select className="input mt-4" value={review.rating} onChange={e=>setReview({...review,rating:Number(e.target.value)})}>{[5,4,3,2,1].map(x=><option key={x} value={x}>{x} stars</option>)}</select><textarea className="input mt-3" placeholder="Tell other clients about your experience" required value={review.comment} onChange={e=>setReview({...review,comment:e.target.value})}/><button className="btn-primary mt-3">Submit review</button></form>}
  </div>;
}
