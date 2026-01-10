"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, Banknote, LogOut, 
  TrendingUp, Landmark, RefreshCw 
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", balance: "" });

  // ---------------------------------------------------------
  // 1. แยกส่วนเช็คสิทธิ์
  // ---------------------------------------------------------
  useEffect(() => {
    const checkAuth = async () => {
      const adminFlag = localStorage.getItem("isAdmin");
      const { data: { session } } = await supabase.auth.getSession();
      
      // ถ้าไม่มีตั๋วสักใบ ดีดออกไปหน้าแรก
      if (!adminFlag && !session) {
        window.location.href = "/"; // ใช้ไม้แข็งดีดออกเลย
      } else if (adminFlag) {
        setIsAdmin(true);
      }
    };
    checkAuth();
  }, []);

  // ---------------------------------------------------------
  // 2. ดึงข้อมูล (แยกออกมาเพื่อให้กด Refresh เองได้)
  // ---------------------------------------------------------
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error("Supabase Error:", error);
      } else {
        setClients(data || []);
      }
    } catch (err) {
      console.error("System Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---------------------------------------------------------
  // ✅ 3. ฟังก์ชัน Logout (แก้ให้ใช้ไม้แข็ง)
  // ---------------------------------------------------------
  const handleLogout = async () => {
    try {
      // 1. ลบตั๋ว Admin ปลอม
      localStorage.removeItem("isAdmin");
      
      // 2. ลบ Session ของ Supabase (ถ้ามี)
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      // 3. 💥 ไม้ตาย: บังคับโหลดหน้าแรกใหม่ (ล้าง Memory เกลี้ยง)
      window.location.href = "/";
    }
  };

  // ---------------------------------------------------------
  // ฟังก์ชันอื่นๆ (เหมือนเดิม)
  // ---------------------------------------------------------
  const handleCreate = async () => {
    if (!formData.name || !formData.balance) return alert("Please fill in all fields");
    const accNum = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(Math.random() * 9)}-${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(10 + Math.random() * 90)}`;
    
    // Optimistic Update
    const fakeNew = { id: Date.now(), name: formData.name, account_number: accNum, balance: formData.balance, status: 'Active' };
    setClients([fakeNew, ...clients]);
    setFormData({ name: "", email: "", balance: "" });

    await supabase.from('clients').insert([{
      name: formData.name,
      account_number: accNum,
      balance: parseFloat(formData.balance),
      region: 'Bangkok',
      status: 'Active'
    }]);
    
    fetchData(); // ดึงข้อมูลใหม่เพื่อความชัวร์
  };

  const totalDeposits = clients.reduce((sum, client) => sum + Number(client.balance), 0);
  const activeAccounts = clients.filter(c => c.status === 'Active').length;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/50">
            <Landmark size={24} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-wide">WAVY BANK</span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <p className="px-4 text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Dashboard</p>
          <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-lg text-white font-medium shadow-sm border border-blue-500/50">
            <LayoutDashboard size={18} /> Overview
          </a>
          <a href="/dashboard/accounts" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <Users size={18} /> Accounts
          </a>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg">A</div>
            <div>
              <p className="text-sm font-bold text-white">ADMIN</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">System Operator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">Executive Overview</h1>
          <div className="flex items-center gap-3">
             <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-bold">
               <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Data
             </button>
             {/* ปุ่ม Logout ที่แก้แล้ว */}
             <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors cursor-pointer">
               <LogOut size={16} /> Logout
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* ส่วนแสดงผล */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Banknote size={64} className="text-blue-600" /></div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Assets</p>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                {totalDeposits.toLocaleString()} <span className="text-sm text-slate-400 font-normal">THB</span>
              </h3>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Active Accounts</p>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{activeAccounts} <span className="text-lg text-slate-400">/ {clients.length}</span></h3>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">System Health</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                <h3 className="text-xl font-bold text-green-600">OPERATIONAL</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold min-w-max"><Users size={20} /> Quick Add Client</div>
              <input placeholder="Full Name" className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <input placeholder="Email" className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              <input type="number" placeholder="Balance" className="w-48 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm" value={formData.balance} onChange={(e) => setFormData({...formData, balance: e.target.value})} />
              <button onClick={handleCreate} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-all">Add</button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><TrendingUp size={18} /> Recent Registrations</h3>
              <a href="/dashboard/accounts" className="text-sm text-blue-600 font-bold hover:underline cursor-pointer">View All Accounts &rarr;</a>
            </div>
            <table className="w-full">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                <tr><th className="px-6 py-4 text-left">Account No.</th><th className="px-6 py-4 text-left">Client Name</th><th className="px-6 py-4 text-right">Balance</th><th className="px-6 py-4 text-center">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.length > 0 ? clients.slice(0, 5).map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-blue-600">{client.account_number}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{client.name}</td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-slate-700">{Number(client.balance).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${client.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{client.status}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400">
                    {loading ? "Loading Data..." : "No data found. Click Refresh Data."}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}