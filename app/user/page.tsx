"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { LogOut, Wallet, Send, RefreshCw, Copy, CheckCircle, Loader2 } from "lucide-react";

export default function UserDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  
  // State โอนเงิน
  const [transferTo, setTransferTo] = useState("");
  const [amount, setAmount] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const initUser = async () => {
      // 1. เช็คว่าล็อกอินยัง?
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/"; // ถ้าไม่ล็อกอิน ดีดกลับ
        return;
      }

      // 2. ค้นหาบัญชีจาก Email (แก้บั๊กสร้างซ้ำตรงนี้)
      const userEmail = session.user.email;
      
      // ใช้ maybeSingle() คือถ้ามีเอามา ถ้าไม่มีคืนค่า null (ไม่ error)
      let { data: existingUser } = await supabase
        .from('clients')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle();

      if (existingUser) {
        // ✅ เจอบัญชีเดิม! โหลดข้อมูลเลย
        console.log("Welcome back:", existingUser.name);
        setProfile(existingUser);
      } else {
        // ❌ ไม่เจอ -> สร้างใหม่ (ครั้งแรกครั้งเดียว)
        console.log("Creating new account for:", userEmail);
        const newAcc = {
          name: session.user.user_metadata.full_name || "ลูกค้า Google",
          email: userEmail,
          account_number: `00${Math.floor(Math.random() * 9)}-${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(10 + Math.random() * 90)}`,
          balance: 500.00, // แจกเงินเริ่มต้น
          status: 'Active',
          region: 'Online'
        };
        
        const { data: createdUser, error } = await supabase
          .from('clients')
          .insert([newAcc])
          .select()
          .single();
          
        if (error) console.error("Create Error:", error);
        setProfile(createdUser);
      }
      setLoading(false);
    };

    initUser();
  }, []);

  const handleTransfer = async () => {
    if (!amount || !transferTo) return alert("กรอกข้อมูลให้ครบครับ");
    if (parseFloat(amount) > profile.balance) return alert("เงินไม่พอครับ");
    if (transferTo === profile.account_number) return alert("โอนให้ตัวเองไม่ได้");

    setLoading(true);
    try {
      // 1. เช็คปลายทาง
      const { data: receiver } = await supabase.from('clients').select('*').eq('account_number', transferTo).single();
      if (!receiver) throw new Error("ไม่พบเลขบัญชีปลายทาง");

      // 2. ตัดเงินเรา + เพิ่มเงินเขา
      await supabase.from('clients').update({ balance: profile.balance - parseFloat(amount) }).eq('id', profile.id);
      await supabase.from('clients').update({ balance: receiver.balance + parseFloat(amount) }).eq('id', receiver.id);
      
      setIsSuccess(true);
      setStatusMsg(`โอนเงิน ${amount} บาท ให้ ${receiver.name} สำเร็จ!`);
      setAmount("");
      
      // 3. อัปเดตยอดเงินในหน้าจอทันที
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

  if (loading) return <div className="h-screen flex flex-col items-center justify-center text-slate-500 gap-2"><Loader2 className="animate-spin text-blue-600" size={40}/><p>กำลังโหลดข้อมูลบัญชี...</p></div>;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 pb-10">
      <header className="bg-blue-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 font-bold text-lg"><Wallet/> WAVY APP</div>
          <button onClick={handleLogout} className="bg-white/20 p-2 rounded-lg"><LogOut size={20}/></button>
        </div>
        <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-xl">
          <p className="text-slate-400 text-xs font-bold uppercase">ยอดเงินคงเหลือ</p>
          <h1 className="text-4xl font-bold text-blue-600 my-2">{profile?.balance?.toLocaleString()} <span className="text-sm text-slate-400">THB</span></h1>
          <div className="border-t pt-4 mt-4 flex justify-between">
             <div><p className="text-xs text-slate-400">ชื่อบัญชี</p><p className="font-bold">{profile?.name}</p></div>
             <div className="text-right"><p className="text-xs text-slate-400">เลขบัญชี</p><p className="font-mono font-bold">{profile?.account_number}</p></div>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-md mx-auto mt-4">
        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Send className="text-blue-600"/> โอนเงิน</h3>
        <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
          {isSuccess && <div className="bg-green-100 text-green-700 p-3 rounded-lg flex gap-2"><CheckCircle/> {statusMsg}</div>}
          <input placeholder="เลขบัญชีปลายทาง" className="w-full border p-3 rounded-xl bg-slate-50 font-mono" value={transferTo} onChange={e => setTransferTo(e.target.value)} />
          <input type="number" placeholder="จำนวนเงิน" className="w-full border p-3 rounded-xl bg-slate-50 font-bold text-lg" value={amount} onChange={e => setAmount(e.target.value)} />
          <button onClick={handleTransfer} disabled={loading} className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold">{loading ? "กำลังทำรายการ..." : "ยืนยันการโอน"}</button>
        </div>
      </div>
    </div>
  );
}