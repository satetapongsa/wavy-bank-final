"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // ล้างค่าเก่าทิ้งก่อนเลย กันมันจำผิด
  useEffect(() => {
    localStorage.removeItem("isAdmin");
  }, []);

  // 1. ล็อกอิน Admin (แบบบ้านๆ)
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // เช็คดื้อๆ เลย ถ้าใช่ก็ปล่อยผ่าน
    if (username === "admin" && (password === "admin" || password === "887624")) {
      localStorage.setItem("isAdmin", "true");
      window.location.href = "/dashboard";
    } else {
      alert("ชื่อหรือรหัสผ่านผิด (ลอง admin / admin ดูครับ)");
    }
  };

  // 2. ล็อกอิน Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/user` },
    });
    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 font-sans text-slate-900 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm border border-slate-200">
        
        <h1 className="text-2xl font-bold text-center mb-6 text-slate-800">WAVY BANK</h1>

        {/* ฟอร์ม Admin */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="admin" 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="password" 
                placeholder="admin" 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-bold hover:bg-slate-800 transition">
            เข้าสู่ระบบ Admin
          </button>
        </form>

        {/* เส้นคั่น */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink-0 mx-4 text-xs text-slate-400">หรือ</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* ปุ่ม Google */}
        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 border border-slate-300 p-2.5 rounded-lg hover:bg-slate-50 font-bold text-slate-700 text-sm"
        >
          {loading ? <Loader2 className="animate-spin" size={18}/> : <LogIn size={18} />} 
          เข้าใช้งานด้วย Google
        </button>

      </div>
    </div>
  );
}