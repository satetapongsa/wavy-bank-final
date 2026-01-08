"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // ระบบเช็ค Email ง่ายๆ (Demo)
    if (email === "admin@infinitybank.com") {
      router.push("/dashboard");
    } else {
      alert("สำหรับ Admin เท่านั้น! (ลองใช้ admin@infinitybank.com)");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-zinc-900 p-8 rounded-2xl shadow-2xl border border-zinc-800 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-yellow-600/20 p-4 rounded-full mb-4">
            <Lock className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Wavy Bank Admin</h1>
          <p className="text-zinc-400 text-sm mt-2">Access Control System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-zinc-400 text-sm mb-2 block">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
              placeholder="admin@infinitybank.com"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold py-3 rounded-lg hover:from-yellow-500 hover:to-yellow-400 transition-all"
          >
            Sign In to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}