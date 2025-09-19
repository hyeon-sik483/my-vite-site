
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  email: string;
  role: string;
  name: string;
}

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);
  const navigate = useNavigate();

  const ADMIN_CODE = 'QUBI2024';

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleLogoClick = () => {
    // 프로젝트 관리 탭으로 이동하는 함수
    window.location.hash = '#projects';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={handleLogoClick}
              className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200 cursor-pointer"
              style={{ fontFamily: '"Pacifico", serif' }}
            >
              연구소 관리 시스템
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <i className="ri-user-line text-white text-sm"></i>
              </div>
              <span className="text-sm font-medium">
                {user.role === 'admin' ? '관리자' : '일반사용자'}
              </span>
              <i className={`ri-arrow-down-s-line text-sm transition-transform duration-200 ${
                isProfileOpen ? 'rotate-180' : ''
              }`}></i>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border z-50 animate-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <i className="ri-user-line text-white text-lg"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        <i className={`${user.role === 'admin' ? 'ri-shield-check-line' : 'ri-user-line'} mr-1`}></i>
                        {user.role === 'admin' ? '관리자' : '일반사용자'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {user.role === 'admin' && (
                    <div className="border rounded-lg p-3 bg-gradient-to-r from-blue-50 to-purple-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          <i className="ri-key-2-line mr-1"></i>
                          관리자 추천코드
                        </span>
                        <button
                          onClick={() => setShowAdminCode(!showAdminCode)}
                          className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer transition-colors duration-200"
                        >
                          {showAdminCode ? '숨기기' : '보기'}
                        </button>
                      </div>
                      {showAdminCode && (
                        <div className="flex items-center space-x-2">
                          <code className="bg-white px-3 py-2 rounded-lg border text-sm font-mono font-bold text-blue-600 flex-1">
                            {ADMIN_CODE}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(ADMIN_CODE);
                              // 복사 완료 피드백 (간단한 방법)
                              const btn = document.activeElement as HTMLButtonElement;
                              const originalText = btn.innerHTML;
                              btn.innerHTML = '<i class="ri-check-line text-green-600"></i>';
                              setTimeout(() => {
                                btn.innerHTML = originalText;
                              }, 1000);
                            }}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors duration-200 p-1"
                            title="복사"
                          >
                            <i className="ri-file-copy-line text-sm"></i>
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        <i className="ri-information-line mr-1"></i>
                        관리자 회원가입 시 사용하는 코드입니다.
                      </p>
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-all duration-200"
                    >
                      <i className="ri-logout-box-line"></i>
                      <span>로그아웃</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
