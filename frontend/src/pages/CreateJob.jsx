import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function CreateJob() {
  const navigate = useNavigate();
  const [form,setForm]=useState({title:"",description:"",category:"",skills:"",budgetMin:"",budgetMax:"",deadline:"",location:""});
  async function submit(e) {
    e.preventDefault();
    await api.post("/jobs", {...form, skills:form.skills.split(",").map(x=>x.trim()).filter(Boolean), budgetMin:Number(form.budgetMin)||0, budgetMax:Number(form.budgetMax)||0});
    navigate("/dashboard");
  }
  return <div className="container-app max-w-3xl py-10"><form onSubmit={submit} className="card"><h1 className="text-3xl font-black">Post a job</h1>{["title","category","location","budgetMin","budgetMax","deadline"].map(k=><div className="mt-4" key={k}><label className="label">{k}</label><input className="input" type={k==="deadline"?"date":["budgetMin","budgetMax"].includes(k)?"number":"text"} required={["title","category"].includes(k)} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>)}<div className="mt-4"><label className="label">Skills</label><input className="input" placeholder="React, Node.js, MongoDB" value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})}/></div><div className="mt-4"><label className="label">Description</label><textarea className="input min-h-40" required value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div><button className="btn-primary mt-6">Publish job</button></form></div>;
}
