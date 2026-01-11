"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  LayoutDashboard, Users, Banknote, LogOut, 
  TrendingUp, Landmark, RefreshCw, AlertTriangle, ShieldCheck 
} from "lucide-react";

export default function Dashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", balance: "" });

  useEffect(() => {
    // เช็คสิทธิ์ทีเดียวพอ
    const adminKey = localStorage.getItem("isAdmin");
    if (adminKey) {
      setIsAdmin(true);
      fetchData();
    }
    // ถ้าไม่มีสิทธิ์ ก็ปล่อยมัน (มันจะไปตกที่ if !isAdmin ด้านล่างเอง)
    // ห้ามใส่ window.location.href ตรงนี้เด็ดขาด เพราะมันจะทำลูป
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('clients').select('*').order('id', { ascending: false });
    if (data) setClients(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    localStorage.clear();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.balance) return;
    const accNum = `101-0-${Math.floor(Math.random()*89999+10000)}-${Math.floor(Math.random()*9)}`;
    
    // โชว์หลอกๆ ก่อน
    setClients([{ id: Date.now(), name: formData.name, account_number: accNum, balance: formData.balance, status: 'Active' }, ...clients]);
    setFormData({ name: "", email: "", balance: "" });

    await supabase.from('clients').insert([{
      name: formData.name, 
      email: formData.email, 
      account_number: accNum, 
      balance: parseFloat(formData.balance),
      status: 'Active',
      region: 'Bangkok'
    }]);
    fetchData();
  };

  const totalAssets = clients.reduce((sum, c) => sum + Number(c.balance), 0);
  const activeUsers = clients.filter(c => c.status === 'Active').length;

  // ------------------------------------------------------------------
  // ⛔️ โซนห้ามเข้า (Access Denied) - แบบนิ่งสนิท ไม่ดีด
  // ------------------------------------------------------------------
  if (!isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-6">
        <AlertTriangle size={80} className="text-red-500" />
        <div className="text-center">
            <h1 className="text-3xl font-bold text-red-500">Access Denied</h1>
            <p className="text-slate-400 mt-2">กรุณาเข้าสู่ระบบด้วยชื่อ admin และรหัสผ่าน admin</p>
        </div>
        <a href="/" className="bg-white text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-slate-200">
          กลับไปหน้า Login
        </a>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // ✅ โซน Dashboard
  // ------------------------------------------------------------------
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg"><Landmark size={24} /></div>
          <span className="font-bold text-lg tracking-wide">WAVY BANK</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-xl font-bold">
            <LayoutDashboard size={20} /> Overview
          </button>
        </nav>
        <div className="p-4 bg-slate-950/30">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">A</div>
             <div><p className="font-bold text-sm">Admin</p><p className="text-xs text-slate-400">Online</p></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex justify-between items-center px-8">
          <h1 className="text-xl font-bold text-slate-800">Executive Dashboard</h1>
          <div className="flex gap-2">
            <button onClick={fetchData} className="p-2 border rounded hover:bg-slate-50"><RefreshCw size={20} className={loading ? 'animate-spin':''}/></button>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded font-bold hover:bg-red-100 flex items-center gap-2">
              <LogOut size={18}/> Logout
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
               <p className="text-xs font-bold text-slate-400">TOTAL ASSETS</p>
               <h3 className="text-3xl font-bold text-slate-900">{totalAssets.toLocaleString()} THB</h3>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-sm">
               <p className="text-xs font-bold text-slate-400">ACTIVE ACCOUNTS</p>
               <h3 className="text-3xl font-bold text-slate-900">{activeUsers}</h3>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-sm">
               <p className="text-xs font-bold text-slate-400">SYSTEM</p>
               <div className="text-green-600 font-bold flex items-center gap-2"><ShieldCheck/> OPERATIONAL</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="bg-white p-6 rounded-xl border shadow-sm h-fit">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Users size={20}/> Quick Add</h3>
                <div className="space-y-3">
                  <input placeholder="Name" className="w-full border p-2 rounded" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})}/>
                  <input placeholder="Email" className="w-full border p-2 rounded" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})}/>
                  <input type="number" placeholder="Balance" className="w-full border p-2 rounded" value={formData.balance} onChange={e=>setFormData({...formData, balance:e.target.value})}/>
                  <button onClick={handleCreate} className="w-full bg-slate-900 text-white py-2 rounded font-bold">Add Client</button>
                </div>
             </div>

             <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b"><tr><th className="p-4">Account</th><th className="p-4">Name</th><th className="p-4">Balance</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
                  <tbody>
                    {clients.map(c => (
                      <tr key={c.id} className="border-b hover:bg-slate-50">
                        <td className="p-4 font-mono text-xs text-blue-600">{c.account_number}</td>
                        <td className="p-4 font-bold">{c.name}</td>
                        <td className="p-4 font-bold">{Number(c.balance).toLocaleString()}</td>
                        <td className="p-4"><span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">{c.status}</span></td>
                        <td className="p-4"><a href={`/dashboard/manage/${c.id}`} className="text-xs bg-slate-900 text-white px-2 py-1 rounded">Manage</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}