import { useState } from "react";
import api from "../lib/api";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    try { const r = await api.post("/auth/forgot-password", { email }); setData(r.data); }
    catch (e) { setError(e.response?.data?.message || "Request failed"); }
  }

  return <div className="container-app flex min-h-[70vh] items-center justify-center">
    <form className="card w-full max-w-md" onSubmit={submit}>
      <h1 className="text-2xl font-black">Reset password</h1>
      <p className="mt-2 text-sm text-slate-500">Enter your account email.</p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {data && <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">{data.message}{data.resetToken && <div className="mt-2 break-all font-mono">Token: {data.resetToken}</div>}</div>}
      <input className="input mt-5" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/>
      <button className="btn-primary mt-4 w-full">Generate reset token</button>
      <Link className="mt-4 block text-center text-sm text-brand-600" to="/login">Back to login</Link>
    </form>
  </div>;
}
