
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../../lib/supabase';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminRegister, setIsAdminRegister] = useState(false);
  const navigate = useNavigate();

  const ADMIN_CODE = 'QUBI2024';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    if (isAdminRegister && formData.adminCode !== ADMIN_CODE) {
      setError('관리자 코드가 올바르지 않습니다.');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: isAdminRegister ? 'admin' : 'user'
      };

      const newUser = await createUser(userData);
      
      if (newUser) {
        alert('회원가입이 완료되었습니다. 로그인해주세요.');
        navigate('/login');
      } else {
        setError('회원가입 중 오류가 발생했습니다. 이미 등록된 이메일일 수 있습니다.');
      }
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
            회원가입
          </h2>
          <p className="text-gray-600">연구소 관리 시스템에 가입하세요</p>
        </div>

        <div className="flex bg-gray-100/70 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => setIsAdminRegister(false)}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              !isAdminRegister 
                ? 'bg-white text-blue-600 shadow-md transform scale-[1.02]' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            일반 회원가입
          </button>
          <button
            type="button"
            onClick={() => setIsAdminRegister(true)}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              isAdminRegister 
                ? 'bg-white text-blue-600 shadow-md transform scale-[1.02]' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            관리자 회원가입
          </button>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl animate-pulse">
              <i className="ri-error-warning-line mr-2"></i>
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                이름
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                placeholder="이름을 입력하세요"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                placeholder="이메일을 입력하세요"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </div>

            {isAdminRegister && (
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200">
                <label htmlFor="adminCode" className="block text-sm font-semibold text-blue-700 mb-2">
                  <i className="ri-shield-check-line mr-2"></i>
                  관리자 추천코드
                </label>
                <input
                  id="adminCode"
                  name="adminCode"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70"
                  placeholder="관리자로부터 받은 추천코드를 입력하세요"
                  value={formData.adminCode}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-blue-600 mt-2">
                  관리자 권한을 받으려면 올바른 추천코드가 필요합니다.
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-all duration-200 transform hover:scale-[1.02]"
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                가입 중...
              </>
            ) : (
              <>
                <i className="ri-user-add-line mr-2"></i>
                회원가입
              </>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium whitespace-nowrap transition-colors duration-200"
            >
              <i className="ri-arrow-left-line mr-1"></i>
              이미 계정이 있으신가요? 로그인하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
