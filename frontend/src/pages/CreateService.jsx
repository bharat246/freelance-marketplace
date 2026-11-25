import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function CreateService() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title:"",description:"",category:"",price:"",deliveryDays:"",availability:"available",samples:"" });
  async function submit(e) {
    e.preventDefault();
    await api.post("/services", {...form, price:Number(form.price), deliveryDays:Number(form.deliveryDays), samples:form.samples.split("\n").filter(Boolean)});
    navigate("/dashboard");
  }
  return <div className="container-app max-w-3xl py-10"><form onSubmit={submit} className="card"><h1 className="text-3xl font-black">Create service</h1>{["title","category","price","deliveryDays"].map(k=><div className="mt-4" key={k}><label className="label">{k}</label><input className="input" type={["price","deliveryDays"].includes(k)?"number":"text"} required value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>)}<div className="mt-4"><label className="label">Description</label><textarea className="input min-h-40" required value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div><div className="mt-4"><label className="label">Work sample URLs (one per line)</label><textarea className="input" value={form.samples} onChange={e=>setForm({...form,samples:e.target.value})}/></div>
<div className="mt-4"><label className="label">Or upload samples (JPG, PNG, WEBP, PDF — max 5MB each)</label><input className="input" type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={async e=>{const urls=[]; for(const file of e.target.files){const fd=new FormData();fd.append("file",file);const r=await api.post("/uploads",fd,{headers:{"Content-Type":"multipart/form-data"}});urls.push(r.data.url)} setForm(f=>({...f,samples:(f.samples?f.samples+"\n":"")+urls.join("\n")}))}}/></div><button className="btn-primary mt-6">Publish service</button></form></div>;
}
