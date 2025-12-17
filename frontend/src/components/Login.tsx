import React, { useState } from 'react';
import { apiFetch } from '../utils/api';

const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isSignup ? '/api/signup' : '/api/login';
      const body = isSignup 
        ? { email, password, name }
        : { email, password };
      
      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        onLogin();
      } else {
        setError(data.error || (isSignup ? 'Đăng ký thất bại' : 'Đăng nhập thất bại'));
      }
    } catch {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#181A20]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[370px] bg-[#23262F] rounded-2xl shadow-2xl px-8 py-10 flex flex-col gap-6 border border-[#23262F]/80"
      >
        <h2 className="text-3xl font-extrabold text-white text-center tracking-tight mb-2">
          {isSignup ? 'Đăng ký Bonjour' : 'Đăng nhập Bonjour'}
        </h2>
        
        {isSignup && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#B1B5C3]">Tên</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-lg border border-[#353945] bg-[#181A20] text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-[#777E90]"
              required={isSignup}
              placeholder="Nhập tên"
            />
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#B1B5C3]">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[#353945] bg-[#181A20] text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-[#777E90]"
            required
            placeholder="Nhập email"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#B1B5C3]">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[#353945] bg-[#181A20] text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-[#777E90]"
            required
            placeholder="Nhập mật khẩu"
          />
        </div>
        {error && <div className="text-red-500 text-sm text-center -mt-2">{error}</div>}
        <button
          type="submit"
          className="w-full bg-[#3772FF] hover:bg-[#155EEF] text-white font-bold py-3 rounded-lg shadow transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          disabled={loading}
        >
          {loading ? (isSignup ? 'Đang đăng ký...' : 'Đang đăng nhập...') : (isSignup ? 'Đăng ký' : 'Đăng nhập')}
        </button>
        
        <div className="text-center text-sm text-[#B1B5C3]">
          {isSignup ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
            }}
            className="text-[#3772FF] hover:underline font-medium"
          >
            {isSignup ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
