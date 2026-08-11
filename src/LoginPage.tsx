import React, { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, User, ArrowRight } from 'lucide-react';

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Giriş bilgileri:', {
      username,
      password
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">

          <div className="bg-slate-900 px-8 py-10 text-center border-b-4 border-red-600">
            <img
              src="/logo.png"
              alt="Realty Center"
              className="h-16 w-auto mx-auto object-contain brightness-0 invert mb-5"
            />

            <h1 className="text-2xl font-black text-white">
              Panel Girişi
            </h1>

            <p className="text-slate-400 text-sm mt-2">
              Realty Center yönetim ve danışman paneline giriş yapın.
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Kullanıcı Adı / E-posta
              </label>

              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Kullanıcı adınızı girin"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Şifre
              </label>

              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifrenizi girin"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-red-600"
                />
                <span className="text-slate-600 font-medium">
                  Beni hatırla
                </span>
              </label>

              <button
                type="button"
                className="text-red-600 hover:text-red-700 font-bold"
              >
                Şifremi unuttum
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30 transition transform hover:scale-[1.02]"
            >
              <span>Giriş Yap</span>
              <ArrowRight className="w-5 h-5" />
            </button>

          </form>

          <div className="border-t border-slate-200 px-8 py-5 text-center bg-slate-50">
            <p className="text-xs text-slate-500 font-medium">
              Yetkisiz kişilerin panele erişmesi yasaktır.
            </p>
          </div>

        </div>

        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-slate-500 hover:text-red-600 font-bold transition"
          >
            ← Ana sayfaya dön
          </a>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;