"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Lock, User, LogIn, Loader2, Landmark } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    localStorage.removeItem("isAdmin"); // ล้างค่าแอดมินเก่าทิ้ง
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && (password === "admins" || password === "887624")) {
      localStorage.setItem("isAdmin", "true");
      window.location.href = "/dashboard";
    } else {
      alert("รหัสผู้ดูแลไม่ถูกต้อง");
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    // 🔥 แก้ตรงนี้: ใช้ window.location.origin เพื่อให้มันใช้ได้ทั้ง Local และ Vercel
    // มันจะแปลงเป็น https://ชื่อโปรเจกต์พี่.vercel.app โดยอัตโนมัติ
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/user`,
      },
    });
    if (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 font-sans text-slate-900 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm border border-slate-200">
        
        <div className="text-center mb-6">
           <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2 text-white">
             <Landmark />
           </div>
           <h1 className="text-2xl font-bold text-slate-800">WAVY BANK</h1>
           <p className="text-xs text-slate-400">Secure Banking System</p>
        </div>

        {/* Admin Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 text-slate-400" size={18} />
            <input type="text" placeholder="Username" className="w-full pl-10 pr-4 py-2 border rounded-lg bg-slate-50 focus:bg-white transition" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
            <input type="password" placeholder="Password" className="w-full pl-10 pr-4 py-2 border rounded-lg bg-slate-50 focus:bg-white transition" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-bold hover:bg-slate-800 transition">Admin Login</button>
        </form>

        <div className="flex items-center my-5"><div className="flex-1 border-t"></div><span className="px-3 text-xs text-slate-400">CUSTOMER</span><div className="flex-1 border-t"></div></div>

        {/* Google Button */}
        <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-2 border border-slate-300 p-2.5 rounded-lg hover:bg-slate-50 font-bold text-slate-700 text-sm transition">
          {loading ? <Loader2 className="animate-spin"/> : <LogIn size={18} />} Login with Google
        </button>
      </div>
    </div>
  );
}