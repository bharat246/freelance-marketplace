import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../lib/api";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "client" });
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    try { await register(form); navigate("/dashboard"); }
    catch (e) { setError(e.response?.data?.message || "Registration failed"); }
  }

  return <div className="container-app flex min-h-[75vh] items-center justify-center py-10">
    <form onSubmit={submit} className="card w-full max-w-md">
      <h1 className="text-3xl font-black">Create account</h1>
      <p className="mt-1 text-slate-500">Choose how you want to use FreelanceHub.</p>
      {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="mt-6"><label className="label">Full name</label><input className="input" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
      <div className="mt-4"><label className="label">Email</label><input className="input" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
      <div className="mt-4"><label className="label">Password</label><input className="input" minLength="6" type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div>
      <div className="mt-4"><label className="label">Account type</label><select className="input" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="client">Client — hire talent</option><option value="freelancer">Freelancer — sell services</option></select></div>
      <button className="btn-primary mt-6 w-full">Create account</button>
      <a className="btn-secondary mt-3 w-full" href={`${API_URL}/auth/google`}>Sign up with Google</a>
      <p className="mt-5 text-center text-sm text-slate-500">Already registered? <Link className="text-brand-600" to="/login">Login</Link></p>
    </form>
  </div>;
}
