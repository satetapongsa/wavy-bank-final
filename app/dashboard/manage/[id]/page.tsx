"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Ban, Trash2, History, ShieldCheck, AlertOctagon } from "lucide-react";

export default function ManageClient() {
  const router = useRouter();
  const params = useParams(); // เอา ID ลูกค้ามาจาก URL
  const [client, setClient] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  // State สำหรับแก้ไข
  const [editName, setEditName] = useState("");
  const [editBalance, setEditBalance] = useState("");

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    // 1. ดึงข้อมูลลูกค้า
    const { data: c } = await supabase.from('clients').select('*').eq('id', params.id).single();
    if (c) {
      setClient(c);
      setEditName(c.name);
      setEditBalance(c.balance);
    }
    // 2. ดึงประวัติธุรกรรม (Traffic)
    const { data: t } = await supabase.from('transactions')
      .select('*')
      .or(`client_id.eq.${params.id}`) // จริงๆควรเช็ค sender/receiver แต่เอาแค่นี้ก่อนง่ายๆ
      .order('created_at', { ascending: false });
    setTransactions(t || []);
  };

  // --- ฟังก์ชันควบคุม (Control Functions) ---

  const handleUpdate = async () => {
    if(!confirm("ยืนยันการแก้ไขข้อมูล?")) return;
    const { error } = await supabase.from('clients')
      .update({ name: editName, balance: parseFloat(editBalance) })
      .eq('id', params.id);
    if (!error) alert("อัปเดตข้อมูลเรียบร้อย!");
  };

  const toggleStatus = async () => {
    const newStatus = client.status === 'Active' ? 'Blocked' : 'Active';
    if(!confirm(`ยืนยันการเปลี่ยนสถานะเป็น ${newStatus}?`)) return;
    
    await supabase.from('clients').update({ status: newStatus }).eq('id', params.id);
    setClient({ ...client, status: newStatus });
  };

  const handleDelete = async () => {
    const txt = prompt("พิมพ์ 'DELETE' เพื่อยืนยันการลบบัญชีถาวร (กู้คืนไม่ได้)");
    if (txt !== 'DELETE') return;

    // 1. ลบ Transaction ก่อน (กัน Error)
    await supabase.from('transactions').delete().eq('client_id', params.id);
    // 2. ลบ Client
    await supabase.from('clients').delete().eq('id', params.id);
    
    alert("ลบบัญชีเรียบร้อย");
    router.push("/dashboard");
  };

  if (!client) return <div className="p-10 font-bold text-slate-400">Loading System...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans text-slate-900">
      
      {/* Header ย้อนกลับ */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <div className="text-right">
          <h1 className="text-xl font-bold text-slate-800">Account Management</h1>
          <p className="text-xs text-slate-400 font-mono">ID: {params.id} | REF: {client.account_number}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ช่อง 1: แก้ไขข้อมูล (Edit Profile) */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 md:col-span-2">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b pb-4"><ShieldCheck className="text-blue-600"/> Edit Information</h2>
          <div className="space-y-6">
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Account Name</label>
                <input className="w-full text-xl font-bold border-b-2 border-slate-200 py-2 outline-none focus:border-blue-600 bg-transparent" 
                  value={editName} onChange={e => setEditName(e.target.value)} />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Total Balance (THB)</label>
                <input type="number" className="w-full text-3xl font-bold text-blue-600 border-b-2 border-slate-200 py-2 outline-none focus:border-blue-600 bg-transparent font-mono" 
                  value={editBalance} onChange={e => setEditBalance(e.target.value)} />
             </div>
             <button onClick={handleUpdate} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
               <Save size={18} /> Save Changes
             </button>
          </div>
        </div>

        {/* ช่อง 2: ควบคุม (Control Actions) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><AlertOctagon className="text-orange-500"/> Danger Zone</h2>
            
            {/* ปุ่ม Freeze */}
            <button onClick={toggleStatus} className={`w-full py-3 rounded-xl font-bold border mb-3 flex justify-center items-center gap-2 ${client.status === 'Active' ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'bg-green-600 text-white border-transparent'}`}>
              {client.status === 'Active' ? <><Ban size={18}/> Freeze Account</> : <><ShieldCheck size={18}/> Unfreeze / Activate</>}
            </button>

            {/* ปุ่ม Delete */}
            <button onClick={handleDelete} className="w-full py-3 rounded-xl font-bold border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition flex justify-center items-center gap-2">
              <Trash2 size={18}/> Delete Permanently
            </button>
          </div>

          <div className="bg-slate-900 text-slate-400 p-6 rounded-2xl text-xs font-mono">
            <p className="text-white font-bold mb-2">SYSTEM STATUS:</p>
            <p>Connection: Secure (TLS)</p>
            <p>Database: Synced</p>
            <p>User Status: {client.status}</p>
          </div>
        </div>

        {/* ช่อง 3: ประวัติธุรกรรม (Traffic) */}
        <div className="md:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><History className="text-slate-500"/> Transaction Traffic</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                  <tr><th className="p-3">Time</th><th className="p-3">Type</th><th className="p-3">Description</th><th className="p-3 text-right">Amount</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.length > 0 ? transactions.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-400">{new Date(t.created_at).toLocaleString()}</td>
                      <td className="p-3"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${t.type === 'Deposit' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>{t.type}</span></td>
                      <td className="p-3 font-medium">{t.description}</td>
                      <td className={`p-3 text-right font-bold ${t.type === 'Deposit' ? 'text-green-600' : 'text-slate-800'}`}>
                        {t.type === 'Deposit' ? '+' : '-'}{Number(t.amount).toLocaleString()}
                      </td>
                    </tr>
                  )) : <tr><td colSpan={4} className="p-8 text-center text-slate-400">No traffic history found.</td></tr>}
                </tbody>
              </table>
            </div>
        </div>

      </div>
    </div>
  );
}