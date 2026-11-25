import { Link, NavLink, Outlet } from "react-router-dom";
import { Bell, BriefcaseBusiness, LogOut, Menu, Search, UserCircle, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const nav = [
    { to: "/", label: "Home" },
    { to: "/services", label: "Services" },
    { to: "/jobs", label: "Jobs" }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="container-app flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-black text-brand-700">
            <BriefcaseBusiness size={25} /> FreelanceHub
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map(n => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold ${isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"}`
              }>{n.label}</NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Link className="btn-secondary !px-3 !py-2" to="/notifications"><Bell size={18}/></Link>
                <Link className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-slate-100" to="/dashboard">
                  {user.avatar ? <img src={user.avatar} className="h-8 w-8 rounded-full object-cover" /> : <UserCircle size={30}/>}
                  <span className="max-w-28 truncate text-sm font-semibold">{user.name}</span>
                </Link>
                <button onClick={logout} className="btn-secondary !px-3 !py-2"><LogOut size={18}/></button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">Login</Link>
                <Link to="/register" className="btn-primary">Get started</Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
        </div>

        {open && (
          <div className="border-t p-4 md:hidden">
            <div className="flex flex-col gap-2">
              {nav.map(n => <Link key={n.to} onClick={() => setOpen(false)} className="rounded-lg p-2" to={n.to}>{n.label}</Link>)}
              {user ? <><Link to="/dashboard" className="rounded-lg p-2">Dashboard</Link><button onClick={logout} className="text-left rounded-lg p-2">Logout</button></> :
                <><Link to="/login" className="rounded-lg p-2">Login</Link><Link to="/register" className="rounded-lg p-2">Register</Link></>}
            </div>
          </div>
        )}
      </header>
      <main><Outlet /></main>
      <footer className="mt-16 border-t bg-white">
        <div className="container-app py-8 text-sm text-slate-500">© {new Date().getFullYear()} FreelanceHub. Built with MERN + TailwindCSS.</div>
      </footer>
    </div>
  );
}
