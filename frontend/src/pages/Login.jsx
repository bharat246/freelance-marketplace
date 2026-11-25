import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../lib/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    try { await login(form); navigate("/dashboard"); }
    catch (e) { setError(e.response?.data?.message || "Login failed"); }
  }

  return <div className="container-app flex min-h-[75vh] items-center justify-center py-10">
    <form onSubmit={submit} className="card w-full max-w-md">
      <h1 className="text-3xl font-black">Welcome back</h1>
      <p className="mt-1 text-slate-500">Login to your marketplace account.</p>
      {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="mt-6"><label className="label">Email</label><input className="input" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
      <div className="mt-4"><label className="label">Password</label><input className="input" type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div>
      <button className="btn-primary mt-6 w-full">Login</button>
      <a className="btn-secondary mt-3 w-full" href={`${API_URL}/auth/google`}>Continue with Google</a>
      <div className="mt-5 flex justify-between text-sm"><Link className="text-brand-600" to="/forgot-password">Forgot password?</Link><Link className="text-brand-600" to="/register">Create account</Link></div>
    </form>
  </div>;
}
