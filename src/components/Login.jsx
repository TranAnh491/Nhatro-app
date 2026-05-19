import { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [mode,     setMode]     = useState('login') // 'login' | 'register'
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
    } catch (err) {
      const msgs = {
        'auth/invalid-credential':   'Email hoặc mật khẩu không đúng',
        'auth/user-not-found':        'Tài khoản không tồn tại',
        'auth/wrong-password':        'Sai mật khẩu',
        'auth/email-already-in-use':  'Email đã được dùng',
        'auth/weak-password':         'Mật khẩu phải ít nhất 6 ký tự',
        'auth/invalid-email':         'Email không hợp lệ',
      }
      setError(msgs[err.code] || 'Có lỗi xảy ra, thử lại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-end sm:items-center justify-center"
         style={{ background: 'linear-gradient(180deg, #007AFF 0%, #0041A8 100%)' }}>

      {/* Background decorations */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 text-center text-white">
        <div className="text-6xl mb-4">🏠</div>
        <h1 className="text-3xl font-bold">Nhà Trọ</h1>
        <p className="text-white/60 text-sm mt-1">Quản lý thông minh</p>
      </div>

      {/* Sheet */}
      <div className="w-full max-w-[430px] bg-[#F2F2F7] rounded-t-[32px] sm:rounded-3xl p-6 sm:p-8 slide-up">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-1 bg-[#D1D1D6] rounded-full sm:hidden" />
        </div>

        <h2 className="text-2xl font-bold text-[#1C1C1E] mb-1">
          {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
        </h2>
        <p className="text-[#8E8E93] text-sm mb-6">
          {mode === 'login' ? 'Dữ liệu đồng bộ mọi thiết bị' : 'Tạo tài khoản để lưu dữ liệu'}
        </p>

        <form onSubmit={handle} className="space-y-3">
          <div>
            <label className="label">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="email@gmail.com" required
              className="input-field-white w-full"
            />
          </div>
          <div>
            <label className="label">Mật khẩu</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required minLength={6}
              className="input-field-white w-full"
            />
          </div>

          {error && (
            <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl px-4 py-3">
              <p className="text-[#FF3B30] text-sm font-medium">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-4 gradient-blue text-white font-bold text-base rounded-2xl
                       shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-transform
                       disabled:opacity-60 mt-2">
            {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </button>
        </form>

        <div className="text-center mt-5">
          <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
            className="text-[#007AFF] text-sm font-medium">
            {mode === 'login' ? 'Chưa có tài khoản? Tạo mới' : 'Đã có tài khoản? Đăng nhập'}
          </button>
        </div>

        <p className="text-center text-xs text-[#C7C7CC] mt-6">
          Dữ liệu được lưu trên Firebase · Bảo mật
        </p>
      </div>
    </div>
  )
}
