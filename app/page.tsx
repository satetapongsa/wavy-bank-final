"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, UserPlus, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false); // สลับโหมด Login/Register
  
  const [formData, setFormData] = useState({ email: "", password: "" });

  // เช็คว่าเคย Login ค้างไว้ไหม
  useEffect(() => {
    const checkSession = async () => {
      // 1. เช็ค Admin ปลอม
      if (localStorage.getItem("isAdmin") === "true") {
        router.push("/dashboard");
        return;
      }
      // 2. เช็ค Supabase User จริง
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
    };
    checkSession();
  }, [router]);

  // ฟังก์ชันจัดการ Login / Register
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ------------------------------------------
      // 1. ระบบ Admin ลับ (ตามสั่ง)
      // ------------------------------------------
      if (formData.email === "admin" && formData.password === "887624") {
        localStorage.setItem("isAdmin", "true"); // ฝัง Cookies ปลอม
        router.push("/dashboard");
        return;
      }

      // ------------------------------------------
      // 2. ระบบคนทั่วไป (Database)
      // ------------------------------------------
      if (isRegister) {
        // --- โหมดสมัครสมาชิก ---
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        alert("สมัครสมาชิกสำเร็จ! โปรดตรวจสอบอีเมลเพื่อยืนยันตัวตน หรือลอง Login ได้เลย");
        setIsRegister(false); // กลับไปหน้า Login
      } else {
        // --- โหมดเข้าสู่ระบบ ---
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        router.push("/dashboard");
      }

    } catch (error: any) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white p-8 border border-slate-100 shadow-2xl rounded-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {isRegister ? "Create Account" : "Log in"}
          </h1>
          <p className="text-slate-500 text-sm">Welcome to Infinity Core Banking</p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-6">
          
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Mail size={16} /> {isRegister ? "Email Address" : "Email or Username"}
            </label>
            <input 
              type="text" 
              required
              className="w-full border-b border-slate-300 px-2 py-3 focus:outline-none focus:border-blue-600 transition-colors bg-transparent placeholder-slate-400 text-black" // <-- แก้สีตัวหนังสือตรงนี้ (text-black)
              placeholder={isRegister ? "name@example.com" : "admin or email"}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Lock size={16} /> Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                required
                className="w-full border-b border-slate-300 px-2 py-3 focus:outline-none focus:border-blue-600 transition-colors bg-transparent placeholder-slate-400 text-black" // <-- แก้สีตัวหนังสือตรงนี้
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* ปุ่ม Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex justify-center items-center gap-2"
          >
            {isRegister ? <><UserPlus size={20} /> Sign Up</> : <><LogIn size={20} /> Log In</>}
          </button>
        </form>

        {/* ตัวสลับโหมด Login / Register */}
        <div className="mt-6 text-center text-sm text-slate-600">
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 font-bold hover:underline ml-1"
          >
            {isRegister ? "Log in here" : "Register now"}
          </button>
        </div>

        {/* Google Login (เฉพาะโหมด Login) */}
        {!isRegister && (
          <>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-400">or access with</span></div>
            </div>
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 border border-slate-200 bg-slate-50 hover:bg-white py-2.5 rounded-lg text-sm font-medium text-slate-700 transition-all hover:shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
          </>
        )}
      </div>
    </div>
  );
}