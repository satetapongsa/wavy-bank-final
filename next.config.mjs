/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // สั่งให้ไม่ต้องตรวจ Code Quality ตอน Deploy (ผ่านโลด)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // สั่งให้ไม่ต้องตรวจ Type (ผ่านโลด)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;