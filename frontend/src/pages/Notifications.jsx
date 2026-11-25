import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Notifications(){
 const [items,setItems]=useState([]);
 async function load(){const {data}=await api.get("/notifications");setItems(data.notifications)}
 useEffect(()=>{load()},[]);
 async function read(id){await api.patch(`/notifications/${id}/read`);load()}
 return <div className="container-app py-10 max-w-3xl"><h1 className="text-3xl font-black">Notifications</h1><div className="mt-6 space-y-3">{items.map(n=><button onClick={()=>read(n._id)} className={`card block w-full text-left ${n.read?"opacity-60":""}`} key={n._id}><div className="flex justify-between"><b>{n.title}</b><small>{new Date(n.createdAt).toLocaleString()}</small></div><p className="mt-1 text-sm text-slate-600">{n.message}</p></button>)}</div>{!items.length&&<p className="mt-10 text-slate-500">No notifications.</p>}</div>
}
