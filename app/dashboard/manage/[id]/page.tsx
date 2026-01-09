"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, Banknote, ShieldCheck, 
  History, LogOut, Search, Building2, TrendingUp, Settings 
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // State สำหรับฟอร์มเพิ่มลูกค้าด่วน (Quick Add)
  const [formData, setFormData] = useState({
    name: "", 
    email: "", 
    balance: "", 
  });

  // ------------------------------------------
  // 1. ระบบรักษาความปลอดภัย (Security Check)
  // ------------------------------------------
  useEffect(() => {
    const checkAuth = async () => {
      // เช็คว่าเป็น Admin ลับ (ที่เราสร้างไว้) หรือไม่?
      const adminFlag = localStorage.getItem("isAdmin");
      
      // เช็คว่าเป็นคนธรรมดา (Login ผ่าน Database) หรือไม่?
      const { data: { session } } = await supabase.auth.getSession();

      if (!adminFlag && !session) {
        // ถ้าไม่มีตั๋วสักใบ -> ดีดกลับหน้าแรกทันที
        router.push("/"); 
      } else {
        // ถ้ามีตั๋ว -> อนุญาตให้โหลดข้อมูล
        if (adminFlag) setIsAdmin(true);
        fetchClients();
      }
    };

    checkAuth();
  }, [router]);

  // ดึงข้อมูลลูกค้าทั้งหมด
  const fetchClients = async () => {
    try {
      const { data, error } = await supabase.from('clients').select('*').order('id', { ascending: false });
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------
  // 2. ฟังก์ชัน Logout (ออกจากระบบ)
  // ------------------------------------------
  const handleLogout = async () => {
    localStorage.removeItem("isAdmin"); // ลบสิทธิ์ Admin
    await supabase.auth.signOut();      // ลบ Session Database
    router.push("/");                   // ดีดกลับหน้า Login
  };

  // ------------------------------------------
  // 3. ฟังก์ชันสร้างลูกค้าใหม่ (Quick Add)
  // ------------------------------------------
  const handleCreate = async () => {
    if (!formData.name || !formData.balance) return alert("Please fill in all fields");
    
    // สุ่มเลขบัญชีให้ดูเหมือนจริง
    const accNum = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(Math.random() * 9)}-${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(10 + Math.random() * 90)}`;

    const newClient = {
      name: formData.name,
      account_number: accNum,
      balance: parseFloat(formData.balance),
      region: 'Bangkok',
      status: 'Active'
    };

    const { error } = await supabase.from('clients').insert([newClient]);
    if (!error) {
      alert("New account created successfully!");
      fetchClients(); // โหลดข้อมูลใหม่ทันที
      setFormData({ name: "", email: "", balance: "" }); // ล้างฟอร์ม
    } else {
      alert("Error creating account");
    }
  };

  // คำนวณตัวเลขสรุปยอด (Stats)
  const totalDeposits = clients.reduce((sum, client) => sum + Number(client.balance), 0);
  const activeAccounts = clients.filter(c => c.status === 'Active').length;

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-bold animate-pulse">Loading System...</div>;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Sidebar เมนูซ้าย (Infinity Core Design) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-white/10 p-2 rounded">
            <Building2 size={24} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-wide">INFINITY CORE</span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <p className="px-4 text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Dashboard</p>
          
          {/* ปุ่มนี้ Active สีน้ำเงิน */}
          <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-lg text-white font-medium shadow-sm transition-all">
            <LayoutDashboard size={18} /> Overview
          </a>
          
          {/* ปุ่มไปหน้า Accounts (Workspace) */}
          <a href="/dashboard/accounts" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <Users size={18} /> Accounts (Workspace)
          </a>
          
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <Banknote size={18} /> Loans
          </a>

          <div className="my-4 border-t border-slate-800"></div>

          <p className="px-4 text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">System</p>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <History size={18} /> Recent Activity
          </a>
        </nav>

        {/* User Info ด้านล่าง */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isAdmin ? 'bg-red-500' : 'bg-blue-500'}`}>
              {isAdmin ? 'A' : 'S'}
            </div>
            <div>
              <p className="text-sm font-bold">{isAdmin ? 'Super Admin' : 'Staff User'}</p>
              <p className="text-xs text-slate-400">System Operator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content พื้นที่ขวา */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">Executive Overview</h1>
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800">{isAdmin ? 'Administrator' : 'Staff'}</p>
              <p className="text-xs text-slate-500">Authorized Access</p>
            </div>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* 1. Cards สรุปยอดเงิน */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Assets */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Banknote size={64} className="text-blue-600" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Deposits (Liabilities)</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {totalDeposits.toLocaleString()} <span className="text-sm text-slate-400 font-normal">THB</span>
              </h3>
            </div>
            
            {/* Active Accounts */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Active Accounts</p>
              <h3 className="text-2xl font-bold text-slate-900">{activeAccounts} / {clients.length}</h3>
            </div>
            
            {/* Pending KYC */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Pending KYCs</p>
              <h3 className="text-2xl font-bold text-slate-900">0</h3>
            </div>
            
            {/* System Health */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">System Health</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <h3 className="text-lg font-bold text-green-600">OPERATIONAL</h3>
              </div>
            </div>
          </div>

          {/* 2. Quick Add Client (ฟอร์มเพิ่มลูกค้าด่วน) */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold min-w-max">
                <Users size={20} /> Quick Add Client
              </div>
              <input 
                placeholder="Full Name" 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <input 
                placeholder="Email (Login ID)" 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <input 
                type="number"
                placeholder="Opening Balance" 
                className="w-48 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                value={formData.balance}
                onChange={(e) => setFormData({...formData, balance: e.target.value})}
              />
              <button 
                onClick={handleCreate}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-slate-900/20 transition-all active:scale-95"
              >
                Create
              </button>
            </div>
          </div>

          {/* 3. Recent Registrations (ตารางย่อ) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={18} /> Recent Registrations
              </h3>
              <a href="/dashboard/accounts" className="text-sm text-blue-600 font-bold hover:underline cursor-pointer">
                View All Accounts &rarr;
              </a>
            </div>
            
            <table className="w-full">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-4 text-left">Account No.</th>
                  <th className="px-6 py-4 text-left">Client Name</th>
                  <th className="px-6 py-4 text-right">Balance</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.slice(0, 5).map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-blue-600">{client.account_number}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{client.name}</td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-slate-700">
                      {Number(client.balance).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${client.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {client.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* กรณีไม่มีข้อมูล */}
            {clients.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm">No clients found. Add one above.</div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}