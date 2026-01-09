"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, Banknote, ShieldCheck, 
  History, LogOut, Search, Building2 
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", balance: "" });

  useEffect(() => {
    const checkAuth = async () => {
      const adminFlag = localStorage.getItem("isAdmin");
      const { data: { session } } = await supabase.auth.getSession();
      if (!adminFlag && !session) {
        router.push("/");
      } else {
        if (adminFlag) setIsAdmin(true);
        fetchClients();
      }
    };
    checkAuth();
  }, [router]);

  const fetchClients = async () => {
    try {
      const { data } = await supabase.from('clients').select('*').order('id', { ascending: false });
      setClients(data || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    localStorage.removeItem("isAdmin");
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleCreate = async () => {
     // ... (ส่วนสร้างลูกค้า ใช้โค้ดเดิมได้เลย หรือถ้าไม่มีบอกผมนะ)
      alert("Function placeholder"); 
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <Building2 size={24} /> <span className="font-bold text-lg">INFINITY CORE</span>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-lg text-white"><LayoutDashboard size={18} /> Overview</a>
          <a href="/dashboard/accounts" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-lg"><Users size={18} /> Accounts</a>
        </nav>
        <div className="p-4 border-t border-slate-800">
           <p className="text-sm font-bold">{isAdmin ? 'Admin' : 'Staff'}</p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">Overview</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg"><LogOut size={16} /> Logout</button>
        </header>
        <div className="p-8">
            <h2 className="text-2xl font-bold">Welcome back!</h2>
            <p className="text-slate-500">System is operational.</p>
            {/* ใส่ Content อื่นๆ ตรงนี้ */}
        </div>
      </main>
    </div>
  );
}