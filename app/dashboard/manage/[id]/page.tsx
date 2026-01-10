"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Save, Ban, CheckCircle, History, 
  User, AlertTriangle, Trash2 
} from "lucide-react";

export default function ManageClient() {
  const router = useRouter();
  const params = useParams();
  const [client, setClient] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [editForm, setEditForm] = useState({ name: "", balance: "" });

  useEffect(() => {
    const fetchData = async () => {
      // ดึงข้อมูลลูกค้า
      const { data: c } = await supabase.from('clients').select('*').eq('id', params.id).single();
      if (c) { 
        setClient(c); 
        setEditForm({ name: c.name, balance: c.balance }); 
      }
      
      // ดึงประวัติธุรกรรม
      const { data: t } = await supabase.from('transactions').select('*').eq('client_id', params.id).order('created_at', { ascending: false });
      setTransactions(t || []);
    };
    fetchData();
  }, [params.id]);

  // ฟังก์ชันบันทึกแก้ไขข้อมูล
  const handleSave = async () => {
    if (!confirm("Confirm update details?")) return;
    const { error } = await supabase.from('clients').update({ 
      name: editForm.name, 
      balance: parseFloat(editForm.balance) 
    }).eq('id', params.id);
    
    if (!error) alert("Profile updated successfully!");
  };

  // ฟังก์ชันอายัด/ปลดอายัด
  const toggleBlock = async () => {
    const newStatus = client.status === 'Active' ? 'Blocked' : 'Active';
    if (!confirm(`Confirm change status to ${newStatus}?`)) return;
    const { error } = await supabase.from('clients').update({ status: newStatus }).eq('id', params.id);
    if (!error) window.location.reload();
  };

  // -------------------------------------------------------
  // 🔥 ฟังก์ชันลบบัญชีถาวร (NEW FUNCTION)
  // -------------------------------------------------------
  const handleDelete = async () => {
    const confirmMsg = "⚠️ คำเตือน: คุณต้องการลบบัญชีนี้ถาวรใช่ไหม?\n\nข้อมูลและประวัติธุรกรรมทั้งหมดจะหายไปและกู้คืนไม่ได้!";
    if (!confirm(confirmMsg)) return;

    try {
      // 1. ลบ Transaction ของคนนี้ทิ้งก่อน (เพื่อกัน Error เรื่อง Foreign Key)
      await supabase.from('transactions').delete().eq('client_id', params.id);

      // 2. ลบข้อมูล Client จริงๆ
      const { error } = await supabase.from('clients').delete().eq('id', params.id);

      if (error) throw error;

      alert("ลบบัญชีเรียบร้อยแล้ว (Account Deleted)");
      router.push('/dashboard/accounts'); // ดีดกลับไปหน้ารายชื่อ

    } catch (error: any) {
      alert("เกิดข้อผิดพลาดในการลบ: " + error.message);
    }
  };

  if (!client) return <div className="p-10 text-center text-slate-400 font-bold">Loading Customer Data...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans text-slate-900">
      
      {/* Header Navigation */}
      <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors">
          <ArrowLeft size={20} /> Back to Accounts
        </button>
        <div className="text-right">
          <p className="text-xs text-slate-400 font-bold uppercase">System ID</p>
          <p className="font-mono text-slate-600">#{params.id}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Edit Profile & Transactions */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Edit Profile Card */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <User className="text-blue-600" /> Edit Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                <input 
                  className="w-full text-lg font-bold border-b-2 border-slate-200 focus:border-blue-600 outline-none py-2 bg-transparent transition-colors" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Balance (THB)</label>
                <input 
                  type="number" 
                  className="w-full text-lg font-bold text-blue-600 border-b-2 border-slate-200 focus:border-blue-600 outline-none py-2 bg-transparent transition-colors" 
                  value={editForm.balance} 
                  onChange={(e) => setEditForm({...editForm, balance: e.target.value})} 
                />
              </div>
              <button 
                onClick={handleSave} 
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              >
                <Save size={18} /> Save Changes
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <History size={18} /> Transaction History
            </h3>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length > 0 ? transactions.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-500">{new Date(t.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{t.description}</td>
                    <td className={`py-3 px-4 text-right font-bold ${t.type === 'Deposit' ? 'text-green-600' : 'text-slate-800'}`}>
                      {t.type === 'Deposit' ? '+' : '-'}{Number(t.amount).toLocaleString()}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="py-8 text-center text-slate-400">No transactions recorded.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Admin Actions */}
        <div className="space-y-6">
          
          {/* Status & Freeze Control */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-orange-500" /> Admin Actions
            </h3>
            
            {/* ปุ่ม Freeze */}
            <button 
              onClick={toggleBlock} 
              className={`w-full py-3 mb-3 rounded-lg font-bold flex justify-center items-center gap-2 border transition-all ${client.status === 'Active' ? 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-600 hover:text-white' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-600 hover:text-white'}`}
            >
              {client.status === 'Active' ? <><Ban size={18} /> Freeze Account</> : <><CheckCircle size={18} /> Unfreeze Account</>}
            </button>

            <div className="border-t border-slate-100 my-4"></div>

            {/* 🔥 ปุ่ม Delete (ใหม่) */}
            <p className="text-xs text-slate-400 mb-2">Danger Zone</p>
            <button 
              onClick={handleDelete} 
              className="w-full py-3 rounded-lg font-bold flex justify-center items-center gap-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white transition-all shadow-sm"
            >
              <Trash2 size={18} /> Delete Account
            </button>
          </div>

          {/* System Logs */}
          <div className="bg-slate-900 text-slate-400 p-6 rounded-xl text-xs font-mono">
            <p className="text-white font-bold mb-2">SYSTEM LOGS:</p>
            <p>- Connected to Database</p>
            <p>- Security Level: High</p>
            <p className="text-green-500">- Ready for commands_</p>
          </div>
        </div>
      </div>
    </div>
  );
}