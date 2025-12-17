import React, { useState } from 'react';
import { apiFetch } from '../utils/api';

const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isSignup && !showOTP) {
        // Step 1: Send OTP
        const res = await apiFetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (res.ok && data.requiresOTP) {
          setShowOTP(true);
        } else {
          setError(data.error || 'Đăng ký thất bại');
        }
      } else if (isSignup && showOTP) {
        // Step 2: Verify OTP
        const res = await apiFetch('/api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp }),
        });
        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem('token', data.token);
          onLogin();
        } else {
          setError(data.error || 'Xác nhận OTP thất bại');
        }
      } else {
        // Login
        const res = await apiFetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem('token', data.token);
          onLogin();
        } else {
          setError(data.error || 'Đăng nhập thất bại');
        }
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
          {isSignup && !showOTP ? 'Đăng ký Bonjour' : isSignup && showOTP ? 'Xác nhận OTP' : 'Đăng nhập Bonjour'}
        </h2>

        {isSignup && showOTP && (
          <div className="text-center text-sm text-[#B1B5C3] mb-2">
            Nhập mã OTP được gửi đến <strong>{email}</strong>
          </div>
        )}
        
        {!showOTP && isSignup && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#B1B5C3]">Tên</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-lg border border-[#353945] bg-[#181A20] text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-[#777E90]"
              required={isSignup && !showOTP}
              placeholder="Nhập tên"
            />
          </div>
        )}
        
        {!showOTP && (
          <>
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
          </>
        )}

        {showOTP && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#B1B5C3]">Mã OTP</label>
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              placeholder="000000"
              className="w-full rounded-lg border border-[#353945] bg-[#181A20] text-white px-4 py-3 text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}

        {error && <div className="text-red-500 text-sm text-center -mt-2">{error}</div>}
        
        <button
          type="submit"
          className="w-full bg-[#3772FF] hover:bg-[#155EEF] text-white font-bold py-3 rounded-lg shadow transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          disabled={loading || (showOTP && otp.length !== 6)}
        >
          {loading ? (
            showOTP ? 'Đang xác nhận...' : isSignup ? 'Đang đăng ký...' : 'Đang đăng nhập...'
          ) : (
            showOTP ? 'Xác nhận' : isSignup ? 'Đăng ký' : 'Đăng nhập'
          )}
        </button>
        
        {!showOTP && (
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
        )}

        {showOTP && (
          <button
            type="button"
            onClick={() => {
              setShowOTP(false);
              setOtp('');
              setError('');
            }}
            className="text-[#B1B5C3] hover:text-white text-sm"
          >
            Quay lại
          </button>
        )}
      </form>
    </div>
  );
};

export default Login;
