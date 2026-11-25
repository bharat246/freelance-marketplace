import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Dashboard from "./pages/Dashboard";
import CreateService from "./pages/CreateService";
import CreateJob from "./pages/CreateJob";
import ContractDetails from "./pages/ContractDetails";
import Notifications from "./pages/Notifications";

export default function App(){
 return <BrowserRouter><Routes>
  <Route element={<Layout/>}>
   <Route path="/" element={<Home/>}/>
   <Route path="/login" element={<Login/>}/>
   <Route path="/register" element={<Register/>}/>
   <Route path="/forgot-password" element={<ForgotPassword/>}/>
   <Route path="/services" element={<Services/>}/>
   <Route path="/services/:id" element={<ServiceDetails/>}/>
   <Route path="/jobs" element={<Jobs/>}/>
   <Route path="/jobs/:id" element={<JobDetails/>}/>
   <Route element={<ProtectedRoute/>}>
    <Route path="/dashboard" element={<Dashboard/>}/>
    <Route path="/notifications" element={<Notifications/>}/>
    <Route path="/contracts/:id" element={<ContractDetails/>}/>
   </Route>
   <Route element={<ProtectedRoute roles={["freelancer"]}/>}>
    <Route path="/create-service" element={<CreateService/>}/>
   </Route>
   <Route element={<ProtectedRoute roles={["client"]}/>}>
    <Route path="/create-job" element={<CreateJob/>}/>
   </Route>
   <Route path="*" element={<div className="container-app py-20 text-center"><h1 className="text-4xl font-black">404</h1><p className="mt-2">Page not found.</p></div>}/>
  </Route>
 </Routes></BrowserRouter>
}
