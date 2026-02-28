'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, FlaskConical, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cookies } from 'next/headers';

const VALID_USERS = [
  { email: 'hecpoley11@gmail.com', code: '0202', name: 'Alchemist' }
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = document.cookie.includes('alchemical_auth');
    if (auth) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 800));

    const user = VALID_USERS.find(u => u.email === email && u.code === code);
    
    if (user) {
      const expires = new Date();
      expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
      document.cookie = `alchemical_auth=${JSON.stringify(user)};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
      router.push('/dashboard');
    } else {
      setError('Credenciales inválidas. Intenta de nuevo.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4B0082]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFD700]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#4B0082] to-[#2d1b69] mb-4"
          >
            <FlaskConical size={40} className="text-[#FFD700]" />
          </motion.div>
          <h1 className="text-3xl font-bold text-[#FFD700] mb-2">Alchemical</h1>
          <p className="text-[#666] text-sm">Where Intelligence is Forged</p>
        </div>

        <form onSubmit={handleLogin} className="bg-[#111]/80 backdrop-blur-xl rounded-2xl p-8 border border-[#FFD700]/10">
          <div className="flex items-center gap-2 mb-6">
            <Lock size={16} className="text-[#FFD700]/60" />
            <h2 className="text-lg font-semibold text-white">Acceso al Grimorio</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[#666] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#0D0D0D] border border-[#333] text-white placeholder-[#444] focus:border-[#FFD700]/50 focus:outline-none transition-colors"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-[#666] mb-2">Código de Acceso</label>
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#0D0D0D] border border-[#333] text-white placeholder-[#444] focus:border-[#FFD700]/50 focus:outline-none transition-colors"
                placeholder="••••"
                required
              />
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4B0082] to-[#2d1b69] text-[#FFD700] font-semibold flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                  <Shield size={20} />
                </motion.div>
              ) : (
                <>
                  <Shield size={20} />
                  <span>Entrar al Sanctum</span>
                </>
              )}
            </motion.button>
          </div>
        </form>

        <p className="text-center text-[#444] text-xs mt-6">
          ⚗️ Alchemical Agent Ecosystem v2.0
        </p>
      </motion.div>
    </div>
  );
}
