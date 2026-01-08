"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Save, Ban, CheckCircle, History,
  User, CreditCard, AlertTriangle
} from "lucide-react";

export default function ManageClient() {
  const router = useRouter();
  const params = useParams(); // ดึง ID จาก URL
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ตัวแปรสำหรับฟอร์มแก้ไข
  const [editForm, setEditForm] = useState({ name: "", balance: "", email: "" });

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    // ดึงข้อมูลลูกค้าคนนี้จาก Database จริง
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('id', params.id)
      .single();

    if (data) {
      setClient(data);
      // เอาข้อมูลเก่ามาใส่ในฟอร์มรอไว้
      setEditForm({
        name: data.name,
        balance: data.balance,
        email: data.name.toLowerCase().replace(/ /g, '') + "@infinitycore.com" // จำลองเมล
      });
    }
    setLoading(false);
  };

  // ------------------------------------------
  // ฟังก์ชัน 1: บันทึกการแก้ไข (Update Real Data)
  // ------------------------------------------
  const handleSave = async () => {
    if (!confirm("Confirm changes to this account?")) return;

    const { error } = await supabase
      .from('clients')
      .update({
        name: editForm.name,
        balance: parseFloat(editForm.balance)
      })
      .eq('id', params.id); // แก้เฉพาะคนที่มี ID นี้

    if (!error) {
      alert("✅ ข้อมูลอัปเดตลง Database เรียบร้อย!");
      fetchClientData(); // โหลดข้อมูลใหม่มาโชว์
    } else {
      alert("❌ Error: " + error.message);
    }
  };

  // ------------------------------------------
  // ฟังก์ชัน 2: บล็อกบัญชี (Block/Unblock)
  // ------------------------------------------
  const toggleBlock = async () => {
    const newStatus = client.status === 'Active' ? 'Blocked' : 'Active';
    const action = newStatus === 'Blocked' ? "ระงับการใช้งาน (Block)" : "ปลดบล็อก (Unblock)";

    if (!confirm(`คุณต้องการ "${action}" บัญชีนี้ใช่ไหม?`)) return;

    const { error } = await supabase
      .from('clients')
      .update({ status: newStatus })
      .eq('id', params.id);

    if (!error) {
      fetchClientData();
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">Loading Customer Data...</div>;
  if (!client) return <div className="p-10 text-center text-red-500">Customer not found!</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans text-slate-900">

      {/* Header & Back Button */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors">
          <ArrowLeft size={20} /> Back to Accounts
        </button>
        <div className="text-right">
          <p className="text-xs text-slate-400 font-bold uppercase">System ID</p>
          <p className="font-mono text-slate-600">#{params.id}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ส่วนที่ 1: การ์ดข้อมูลหลัก (แก้ไขได้) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <User className="text-blue-600" /> Edit Profile
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-2 ${client.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {client.status === 'Active' ? <CheckCircle size={14} /> : <Ban size={14} />}
                {client.status}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account Name (Legal Name)</label>
                <input
                  type="text"
                  className="w-full text-lg font-bold border-b-2 border-slate-200 focus:border-blue-600 outline-none py-2 bg-transparent transition-colors"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account Number</label>
                  <div className="font-mono text-slate-400 py-2 select-all">{client.account_number}</div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Balance (THB)</label>
                  <input
                    type="number"
                    className="w-full text-lg font-bold text-blue-600 border-b-2 border-slate-200 focus:border-blue-600 outline-none py-2 bg-transparent transition-colors"
                    value={editForm.balance}
                    onChange={(e) => setEditForm({ ...editForm, balance: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex justify-end">
                <button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ส่วนที่ 2: เมนูจัดการความเสี่ยง (Block/Unblock) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-orange-500" /> Administrative Actions
            </h3>

            <p className="text-sm text-slate-500 mb-4">
              {client.status === 'Active'
                ? "หากพบพฤติกรรมน่าสงสัย คุณสามารถระงับบัญชีนี้ได้ชั่วคราว การทำธุรกรรมทั้งหมดจะถูกปฏิเสธ"
                : "บัญชีนี้ถูกระงับอยู่ หากตรวจสอบแล้วปลอดภัย สามารถปลดบล็อกได้ทันที"}
            </p>

            <button
              onClick={toggleBlock}
              className={`w-full py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition-all border ${client.status === 'Active'
                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white'
                : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-600 hover:text-white'
                }`}
            >
              {client.status === 'Active' ? <><Ban size={18} /> Block Account</> : <><CheckCircle size={18} /> Unblock Account</>}
            </button>
          </div>

          <div className="bg-slate-900 text-slate-400 p-6 rounded-xl text-xs font-mono">
            <p>- Account loaded successfully.</p>
            <p>- Connection: Secure (SSL)</p>
            <p>- Database: Connected</p>
            <p className="text-green-500">- Ready for commands_</p>
          </div>
        </div>

      </div>
    </div>
  );
}
 