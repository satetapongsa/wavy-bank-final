"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Ban, CheckCircle, History, CreditCard, User, Wallet } from "lucide-react";

export default function ManageClient() {
  const router = useRouter();
  const params = useParams();
  const [client, setClient] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับแก้ไขข้อมูล
  const [editForm, setEditForm] = useState({ name: "", balance: "" });

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    // 1. ดึงข้อมูลลูกค้า
    const { data: clientData } = await supabase.from('clients').select('*').eq('id', params.id).single();
    if (clientData) {
      setClient(clientData);
      setEditForm({ name: clientData.name, balance: clientData.balance });
    }

    // 2. ดึงประวัติธุรกรรม
    const { data: transData } = await supabase.from('transactions').select('*').eq('client_id', params.id).order('created_at', { ascending: false });
    setTransactions(transData || []);
    setLoading(false);
  };

  // ฟังก์ชันบันทึกการแก้ไข (ชื่อ/เงิน)
  const handleUpdate = async () => {
    const { error } = await supabase.from('clients').update({
      name: editForm.name,
      balance: parseFloat(editForm.balance)
    }).eq('id', params.id);

    if (!error) {
      alert("Updated Successfully!");
      fetchClientData();
    }
  };

  // ฟังก์ชัน บล็อก/ปลดบล็อก
  const toggleBlockStatus = async () => {
    const newStatus = client.status === 'Active' ? 'Blocked' : 'Active';
    const { error } = await supabase.from('clients').update({ status: newStatus }).eq('id', params.id);
    if (!error) fetchClientData();
  };

  if (loading) return <div className="p-8 text-center">Loading Client Data...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      {/* Header ย้อนกลับ */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-medium">
        <ArrowLeft size={20} /> Back to Accounts
      </button>

      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header ส่วนตัว */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{client.name}</h1>
            <p className="text-slate-500 font-mono mt-1">Account No: {client.account_number}</p>
          </div>
          <div className={`px-4 py-2 rounded-full font-bold uppercase flex items-center gap-2 ${client.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {client.status === 'Active' ? <CheckCircle size={18} /> : <Ban size={18} />}
            {client.status}
          </div>
        </div>

        {/* Grid แบ่งครึ่ง: ซ้ายแก้ข้อมูล / ขวาประวัติ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Column ซ้าย: จัดการบัญชี */}
          <div className="md:col-span-1 space-y-6">
            
            {/* กล่องแก้ไขข้อมูล */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><User size={18} /> Edit Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Account Name</label>
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Current Balance (THB)</label>
                  <input 
                    type="number" 
                    value={editForm.balance}
                    onChange={(e) => setEditForm({...editForm, balance: e.target.value})}
                    className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-bold text-lg"
                  />
                </div>
                <button 
                  onClick={handleUpdate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold flex justify-center items-center gap-2"
                >
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </div>

            {/* กล่อง Block Account */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><ShieldAlert size={18} /> Security Actions</h3>
              <p className="text-sm text-slate-500 mb-4">
                {client.status === 'Active' 
                  ? "Blocking this account will prevent all transfers and logins immediately." 
                  : "Unblocking will restore full access to this account."}
              </p>
              <button 
                onClick={toggleBlockStatus}
                className={`w-full py-2 rounded-lg font-bold flex justify-center items-center gap-2 transition-colors ${client.status === 'Active' ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'}`}
              >
                {client.status === 'Active' ? <><Ban size={18} /> Block Account</> : <><CheckCircle size={18} /> Unblock Account</>}
              </button>
            </div>
          </div>

          {/* Column ขวา: ประวัติธุรกรรม */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><History size={18} /> Transaction History</h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{transactions.length} records</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="px-6 py-3 text-left">Date</th>
                      <th className="px-6 py-3 text-left">Type</th>
                      <th className="px-6 py-3 text-left">Description</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.length > 0 ? (
                      transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="px-6 py-3 text-sm text-slate-500">{new Date(t.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${t.type === 'Deposit' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                              {t.type}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-slate-800">{t.description}</td>
                          <td className={`px-6 py-3 text-right font-bold text-sm ${t.type === 'Deposit' ? 'text-green-600' : 'text-slate-800'}`}>
                            {t.type === 'Deposit' ? '+' : '-'}{Number(t.amount).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400">No transactions found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}