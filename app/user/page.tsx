"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { LogOut, Wallet, Send, RefreshCw, Copy, CheckCircle } from "lucide-react";

export default function UserDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [transferTo, setTransferTo] = useState("");
  const [amount, setAmount] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const protectUserRoute = async () => {
      // 1. ถ้ามีตั๋ว Admin คาอยู่ -> ดีดไปหน้า Admin เลย
      if (localStorage.getItem("isAdmin")) {
        window.location.href = "/dashboard";
        return;
      }

      // 2. ถ้าไม่มี Session (ไม่ได้ล็อกอิน) -> ดีดไปหน้า Login
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/";
        return;
      }

      // 3. ผ่านด่าน -> โหลดข้อมูล
      fetchUserData(session);
    };

    protectUserRoute();
  }, []);

  const fetchUserData = async (session: any) => {
    try {
      // หาบัญชี
      let { data: userAcc } = await supabase.from('clients').select('*').eq('email', session.user.email).single();

      // ถ้าไม่มี -> สร้างใหม่
      if (!userAcc) {
        const newAcc = {
          name: session.user.user_metadata.full_name || "New Customer",
          email: session.user.email,
          account_number: `00${Math.floor(Math.random() * 9)}-${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(10 + Math.random() * 90)}`,
          balance: 500,
          status: 'Active',
          region: 'Online'
        };
        const { data } = await supabase.from('clients').insert([newAcc]).select().single();
        userAcc = data;
      }
      setProfile(userAcc);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!amount || !transferTo) return alert("กรุณากรอกข้อมูลให้ครบ");
    if (parseFloat(amount) > profile.balance) return alert("ยอดเงินไม่พอ");
    
    setLoading(true);
    try {
      const { data: receiver } = await supabase.from('clients').select('*').eq('account_number', transferTo).single();
      if (!receiver) throw new Error("ไม่พบเลขบัญชีปลายทาง");

      await supabase.from('clients').update({ balance: profile.balance - parseFloat(amount) }).eq('id', profile.id);
      await supabase.from('clients').update({ balance: receiver.balance + parseFloat(amount) }).eq('id', receiver.id);
      
      setIsSuccess(true);
      setStatusMsg(`โอนเงิน ${amount} บาท ให้ ${receiver.name} สำเร็จ!`);
      setAmount("");
      setTransferTo("");
      
      // Refresh ข้อมูลตัวเอง
      const { data: updatedMe } = await supabase.from('clients').select('*').eq('id', profile.id).single();
      setProfile(updatedMe);

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading && !profile) return <div className="h-screen flex items-center justify-center text-slate-400">Loading App...</div>;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 pb-10">
      {/* Header */}
      <header className="bg-blue-600 text-white p-6 shadow-lg rounded-b-3xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2"><div className="bg-white/20 p-2 rounded-lg"><Wallet size={24} /></div><span className="font-bold text-lg tracking-wide">WAVY APP</span></div>
          <button onClick={handleLogout} className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition"><LogOut size={20} /></button>
        </div>
        <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-xl mt-4">
          <p className="text-slate-400 text-xs uppercase font-bold mb-1">ยอดเงินคงเหลือ</p>
          <h1 className="text-4xl font-bold text-blue-600 mb-4">{profile?.balance?.toLocaleString()} <span className="text-sm text-slate-400">THB</span></h1>
          <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
             <div><p className="text-xs text-slate-400">ชื่อบัญชี</p><p className="font-bold">{profile?.name}</p></div>
             <div className="text-right"><p className="text-xs text-slate-400">เลขบัญชี</p><p className="font-mono font-bold flex items-center gap-2">{profile?.account_number}<Copy size={14} className="text-blue-500 cursor-pointer" onClick={() => {navigator.clipboard.writeText(profile.account_number); alert("Copied!")}}/></p></div>
          </div>
        </div>
      </header>

      {/* Transfer */}
      <div className="p-6 mt-2 max-w-md mx-auto">
        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Send size={18} className="text-blue-600"/> โอนเงินด่วน</h3>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          {isSuccess && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 mb-4"><CheckCircle size={24} /><div className="text-sm font-bold">{statusMsg}</div></div>}
          <div><label className="text-xs font-bold text-slate-400 uppercase">เลขบัญชีปลายทาง</label><input placeholder="ระบุเลขบัญชี" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl mt-1 text-lg font-mono outline-none focus:border-blue-500" value={transferTo} onChange={(e) => { setTransferTo(e.target.value); setIsSuccess(false); }} /></div>
          <div><label className="text-xs font-bold text-slate-400 uppercase">จำนวนเงิน</label><input type="number" placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl mt-1 text-2xl font-bold text-blue-600 outline-none focus:border-blue-500" value={amount} onChange={(e) => { setAmount(e.target.value); setIsSuccess(false); }} /></div>
          <button onClick={handleTransfer} disabled={loading} className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-lg mt-2 flex justify-center items-center gap-2">{loading ? <RefreshCw className="animate-spin"/> : "ยืนยันการโอน"}</button>
        </div>
      </div>
    </div>
  );
}