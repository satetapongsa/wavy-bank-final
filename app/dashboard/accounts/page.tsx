"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Search, Settings, ShieldAlert, Building2, LayoutDashboard, Users, Banknote, LogOut } from "lucide-react";

export default function AccountsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const { data } = await supabase.from('clients').select('*').order('id', { ascending: false });
    setClients(data || []);
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar (เหมือนเดิมเพื่อให้ดูต่อเนื่อง) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-white/10 p-2 rounded"><Building2 size={24} /></div>
          <span className="font-bold text-lg tracking-wide">INFINITY CORE</span>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors">
            <LayoutDashboard size={18} /> Overview
          </a>
          <a href="/dashboard/accounts" className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-sm">
            <Users size={18} /> Accounts (Workspace)
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-lg"><Banknote size={18} /> Loans</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">Account Management Workspace</h1>
        </header>

        <div className="p-8 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">All Registered Accounts</h3>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input placeholder="Search client..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            
            <table className="w-full">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-4 text-left">Account No.</th>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-right">Balance</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-blue-600">{client.account_number}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{client.name}</td>
                    <td className="px-6 py-4 text-right">{Number(client.balance).toLocaleString()} THB</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${client.status === 'Blocked' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => router.push(`/dashboard/manage/${client.id}`)}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 mx-auto"
                      >
                        <Settings size={14} /> Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}