
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 기본 관리자 계정 확인
      if (email === 'qubi6018@admin.com' && password === 'qubi6018!') {
        localStorage.setItem('user', JSON.stringify({
          id: 'admin-default',
          email: 'qubi6018@admin.com',
          role: 'admin',
          name: '관리자'
        }));
        navigate('/dashboard');
      } else {
        // Supabase에서 사용자 로그인
        const user = await loginUser(email, password);
        
        if (user) {
          localStorage.setItem('user', JSON.stringify({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
          }));
          navigate('/dashboard');
        } else {
          setError('이메일 또는 비밀번호가 잘못되었습니다.');
        }
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
        <div className="text-center">
          <div className="mb-6">
            <img 
              src="https://static.readdy.ai/image/8671b37373fff7bf1c8d68b621db1161/cb8210a46a813645eb9ed9d178baeda2.png" 
              alt="QUBICOM Logo" 
              className="h-16 mx-auto object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            로그인
          </h2>
          <p className="text-gray-600">연구소 관리 시스템에 접속하세요</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl animate-pulse">
              <i className="ri-error-warning-line mr-2"></i>
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="ri-mail-line mr-2"></i>
                이메일
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-5 0 focus:border-transparent transition-all duration-200 bg-white/50"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="ri-lock-line mr-2"></i>
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-5 0 focus:border-transparent transition-all duration-200 bg-white/50"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-all duration-200 transform hover:scale-[1.02]"
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                로그인 중...
              </>
            ) : (
              <>
                <i className="ri-login-box-line mr-2"></i>
                로그인
              </>
            )}
          </button>

          <div className="space-y-3">
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-blue-600 hover:text-blue-5 0 text-sm font-medium whitespace-nowrap transition-colors duration-200"
              >
                <i className="ri-user-add-line mr-1"></i>
                회원가입하기
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
