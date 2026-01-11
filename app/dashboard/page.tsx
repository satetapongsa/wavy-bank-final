"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  LayoutDashboard, Users, Banknote, LogOut, 
  TrendingUp, Landmark, RefreshCw, ShieldCheck, AlertTriangle, Activity 
} from "lucide-react";

export default function Dashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // State สำหรับฟอร์ม
  const [formData, setFormData] = useState({ name: "", email: "", balance: "" });

  useEffect(() => {
    // 1. เช็คสิทธิ์แบบ Manual (ไม่ Auto Redirect กันลูป)
    const checkAdmin = localStorage.getItem("isAdmin");
    if (checkAdmin) {
      setIsAdmin(true);
      fetchData(); // มีสิทธิ์ค่อยดึง
    } else {
      // ถ้าไม่มีสิทธิ์ ไม่ทำอะไรเลย ปล่อยให้หน้าจอ Render ปุ่ม "Access Denied" (ดูข้างล่าง)
      // แบบนี้ไม่มีทาง Loop แน่นอน
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // ดึงข้อมูล
      const { data } = await supabase.from('clients').select('*').order('id', { ascending: false });
      setClients(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // ล้างไพ่
    localStorage.clear();
    await supabase.auth.signOut();
    // กลับหน้าแรก
    window.location.href = "/";
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.balance) return alert("กรอกข้อมูลให้ครบก่อนครับ");
    const accNum = `101-0-${Math.floor(Math.random() * 89999 + 10000)}-${Math.floor(Math.random() * 9)}`;
    
    // Optimistic UI (โชว์ก่อน)
    const fake = { id: Date.now(), name: formData.name, account_number: accNum, balance: formData.balance, status: 'Active' };
    setClients([fake, ...clients]);
    setFormData({ name: "", email: "", balance: "" });

    // ส่งจริง
    await supabase.from('clients').insert([{
      name: formData.name,
      email: formData.email || `user${Date.now()}@temp.com`,
      account_number: accNum,
      balance: parseFloat(formData.balance),
      status: 'Active',
      region: 'Bangkok'
    }]);
    
    fetchData(); // ดึงใหม่เพื่อความชัวร์
  };

  const totalAssets = clients.reduce((sum, c) => sum + Number(c.balance), 0);
  const activeUsers = clients.filter(c => c.status === 'Active').length;

  // ------------------------------------------------------------------
  // ⛔️ โซนกันผี: ถ้าไม่ใช่ Admin ให้โชว์หน้านี้ (นิ่งๆ ไม่รีเฟรช)
  // ------------------------------------------------------------------
  if (!isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
        <AlertTriangle size={64} className="text-red-500" />
        <h1 className="text-2xl font-bold">Access Denied (ไม่มีสิทธิ์เข้าถึง)</h1>
        <p className="text-slate-400">กรุณาเข้าสู่ระบบด้วยรหัส Admin (887624)</p>
        <button 
          onClick={() => window.location.href = "/"}
          className="bg-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition"
        >
          กลับไปหน้า Login
        </button>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // ✅ โซน Admin: ถ้าผ่านด่านมาได้ ให้โชว์ Dashboard
  // ------------------------------------------------------------------
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg"><Landmark size={24} /></div>
          <span className="font-bold text-lg tracking-wide">WAVY BANK</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Main Menu</div>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-xl font-bold">
            <LayoutDashboard size={20} /> Executive Overview
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold shadow-lg">A</div>
            <div><p className="text-sm font-bold">Administrator</p><p className="text-[10px] text-slate-400">System Access: Full</p></div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 bg-white border-b border-slate-200 flex justify-between items-center px-8 shadow-sm z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Financial Command Center</h1>
            <p className="text-slate-400 text-xs">Real-time Banking Monitoring System</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchData} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"><RefreshCw size={20} className={loading ? "animate-spin" : ""} /></button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-600 hover:text-white font-bold transition cursor-pointer">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-20">
          
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 p-4 opacity-5"><Banknote size={80} /></div>
              <p className="text-xs font-bold text-slate-400 uppercase">Total Assets</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{totalAssets.toLocaleString()} <span className="text-sm font-normal text-slate-400">THB</span></h3>
              <div className="mt-4 text-xs font-bold text-green-600 flex items-center gap-1"><TrendingUp size={14}/> +2.4% Growth</div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase">Active Accounts</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{activeUsers}</h3>
              <div className="mt-4 text-xs font-bold text-blue-600 flex items-center gap-1"><ShieldCheck size={14}/> Verified Users</div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase">System Health</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
                <span className="font-bold text-green-600 text-lg">OPERATIONAL</span>
              </div>
            </div>
          </div>

          {/* Registration & Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Users size={20} className="text-blue-600"/> Fast Registration</h3>
              <div className="space-y-3">
                <input placeholder="Client Name" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input placeholder="Email" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <input type="number" placeholder="Initial Deposit" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm" value={formData.balance} onChange={e => setFormData({...formData, balance: e.target.value})} />
                <button onClick={handleCreate} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition">Create Account</button>
              </div>
            </div>

            {/* Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Activity size={20} className="text-blue-600"/> Live Database</h3>
              </div>
              <div className="overflow-y-auto max-h-[400px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase sticky top-0">
                    <tr><th className="p-4">Account</th><th className="p-4">Name</th><th className="p-4 text-right">Balance</th><th className="p-4 text-center">Status</th><th className="p-4 text-center">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clients.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-mono text-xs text-slate-500">{c.account_number}</td>
                        <td className="p-4 font-bold text-slate-700">{c.name}</td>
                        <td className="p-4 text-right font-bold text-slate-900">{Number(c.balance).toLocaleString()}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <a href={`/dashboard/manage/${c.id}`} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 transition">
                            Manage
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}