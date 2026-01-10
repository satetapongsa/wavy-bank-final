"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  LayoutDashboard, Users, Banknote, LogOut, 
  TrendingUp, Landmark, RefreshCw 
} from "lucide-react";

export default function Dashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // ปิด loading เริ่มต้นไปเลย จะได้เห็นหน้าเว็บแน่ๆ
  const [formData, setFormData] = useState({ name: "", email: "", balance: "" });

  // ---------------------------------------------------------
  // 1. เปิดมาสั่งดึงข้อมูลเลย (ไม่สนสิทธิ์ ไม่สนเหี้ยไรทั้งนั้น ขอข้อมูลก่อน)
  // ---------------------------------------------------------
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error("Error:", error);
      } else {
        setClients(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // 2. ปุ่ม Logout (ล้างทุกอย่างแล้วถีบออก)
  // ---------------------------------------------------------
  const handleLogout = async () => {
    localStorage.clear(); // ล้าง LocalStorage เกลี้ยง
    await supabase.auth.signOut(); // ล้าง Supabase
    window.location.href = "/"; // สั่งรีเฟรชกลับหน้าแรก
  };

  // ฟังก์ชันเพิ่มข้อมูล
  const handleCreate = async () => {
    if (!formData.name || !formData.balance) return alert("ใส่ข้อมูลให้ครบก่อนครับพี่");
    
    // ยัดข้อมูลปลอมโชว์ก่อนเลย (จะได้รู้สึกว่าเร็ว)
    const accNum = `101-0-${Math.floor(Math.random() * 99999)}-9`;
    const fakeNew = { id: Date.now(), name: formData.name, account_number: accNum, balance: formData.balance, status: 'Active' };
    setClients([fakeNew, ...clients]);
    
    setFormData({ name: "", email: "", balance: "" }); // ล้างฟอร์ม

    // ส่งเข้า Database จริง
    await supabase.from('clients').insert([{
      name: formData.name,
      account_number: accNum,
      balance: parseFloat(formData.balance),
      region: 'Bangkok',
      status: 'Active'
    }]);
    
    // ดึงข้อมูลจริงตามหลัง
    fetchData();
  };

  const totalDeposits = clients.reduce((sum, client) => sum + Number(client.balance), 0);
  const activeAccounts = clients.filter(c => c.status === 'Active').length;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Landmark size={24} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-wide">WAVY BANK</span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-lg text-white font-medium">
            <LayoutDashboard size={18} /> Overview
          </a>
          <a href="/dashboard/accounts" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg">
            <Users size={18} /> Accounts
          </a>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">A</div>
            <div>
              <p className="text-sm font-bold text-white">ADMIN</p>
              <p className="text-[10px] text-slate-400">System Operator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">Executive Overview</h1>
          <div className="flex items-center gap-3">
             <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-blue-600 border rounded-lg">
               <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
             </button>
             <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-600 hover:text-white font-bold transition-colors">
               <LogOut size={16} /> Logout
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Banknote size={64} className="text-blue-600" /></div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Assets</p>
              <h3 className="text-3xl font-bold text-slate-900">
                {totalDeposits.toLocaleString()} <span className="text-sm text-slate-400 font-normal">THB</span>
              </h3>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Active Accounts</p>
              <h3 className="text-3xl font-bold text-slate-900">{activeAccounts} <span className="text-lg text-slate-400">/ {clients.length}</span></h3>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">System Status</p>
              <h3 className="text-xl font-bold text-green-600 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span> ONLINE
              </h3>
            </div>
          </div>

          {/* Quick Add */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold min-w-max"><Users size={20} /> Quick Add</div>
              <input placeholder="Name" className="flex-1 border p-2 rounded" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <input placeholder="Email" className="flex-1 border p-2 rounded" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              <input type="number" placeholder="Balance" className="w-32 border p-2 rounded" value={formData.balance} onChange={(e) => setFormData({...formData, balance: e.target.value})} />
              <button onClick={handleCreate} className="bg-slate-900 text-white px-6 py-2 rounded font-bold hover:bg-slate-800">Add</button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
            <table className="w-full">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                <tr><th className="px-6 py-4 text-left">Account</th><th className="px-6 py-4 text-left">Name</th><th className="px-6 py-4 text-right">Balance</th><th className="px-6 py-4 text-center">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.length > 0 ? clients.map((client) => (
                  <tr key={client.id}>
                    <td className="px-6 py-4 text-sm font-mono text-blue-600">{client.account_number}</td>
                    <td className="px-6 py-4 text-sm font-bold">{client.name}</td>
                    <td className="px-6 py-4 text-sm text-right font-bold">{Number(client.balance).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{client.status}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400">
                    {loading ? "กำลังโหลด..." : "ไม่พบข้อมูล (ลองกด Refresh ดูครับ)"}
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