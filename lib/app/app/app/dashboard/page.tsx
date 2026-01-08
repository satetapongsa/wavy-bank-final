"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Search, Plus, Trash2, Users, DollarSign, Activity } from "lucide-react";

export default function Dashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "", account_number: "", balance: "", region: "Bangkok", status: "Active"
  });

  // ดึงข้อมูลเมื่อเปิดหน้าเว็บ
  useEffect(() => {
    fetchClients();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.account_number) return;
    
    const { error } = await supabase.from('clients').insert([formData]);
    if (!error) {
      fetchClients();
      setIsModalOpen(false);
      setFormData({ name: "", account_number: "", balance: "", region: "Bangkok", status: "Active" });
    } else {
      alert("Error adding client");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this client?")) {
      const { error } = await supabase.from('clients').delete().match({ id });
      if (!error) fetchClients();
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Data...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 p-4 bg-zinc-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-black font-bold">W</div>
            <span className="font-bold text-xl">Wavy Admin</span>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <Plus size={18} /> New Client
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-zinc-400 text-sm">Total Clients</p>
                <h3 className="text-3xl font-bold mt-1">{clients.length}</h3>
              </div>
              <div className="bg-blue-500/20 p-2 rounded-lg"><Users className="text-blue-500" /></div>
            </div>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
             <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-zinc-400 text-sm">Active Accounts</p>
                <h3 className="text-3xl font-bold mt-1">{clients.filter(c => c.status === 'Active').length}</h3>
              </div>
              <div className="bg-green-500/20 p-2 rounded-lg"><Activity className="text-green-500" /></div>
            </div>
          </div>
        </div>

        {/* Database Table */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-xl font-bold">Client Database</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/40 text-left text-zinc-400 text-sm">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Account No.</th>
                  <th className="p-4">Balance</th>
                  <th className="p-4">Region</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4 font-medium">{client.name}</td>
                    <td className="p-4 text-zinc-400 font-mono">{client.account_number}</td>
                    <td className="p-4 text-green-400">${Number(client.balance).toLocaleString()}</td>
                    <td className="p-4"><span className="px-2 py-1 bg-zinc-800 rounded text-xs">{client.region}</span></td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${client.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(client.id)} className="text-zinc-500 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 w-full max-w-lg rounded-2xl border border-zinc-800 p-6">
            <h2 className="text-xl font-bold mb-6">Add New Client</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder="Full Name" className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <input placeholder="Account Number" className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white" 
                value={formData.account_number} onChange={e => setFormData({...formData, account_number: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Balance" className="bg-black border border-zinc-700 p-3 rounded-lg text-white" 
                  value={formData.balance} onChange={e => setFormData({...formData, balance: e.target.value})} />
                <select className="bg-black border border-zinc-700 p-3 rounded-lg text-white"
                  value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})}>
                  <option>Bangkok</option><option>North</option><option>South</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-zinc-800 py-3 rounded-lg hover:bg-zinc-700">Cancel</button>
                <button type="submit" className="flex-1 bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400">Save Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}