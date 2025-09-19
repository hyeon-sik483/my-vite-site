
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import MyProjects from './components/MyProjects';
import ProjectManagement from './components/ProjectManagement';
import BiddingNotices from './components/BiddingNotices';
import NewsSection from './components/NewsSection';
import Calendar from './components/Calendar';

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('my-projects');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));

    // URL 해시 확인하여 탭 설정
    const hash = window.location.hash.replace('#', '');
    if (hash && ['my-projects', 'projects', 'bidding', 'news', 'calendar'].includes(hash)) {
      setActiveTab(hash);
    }

    // 해시 변경 이벤트 리스너
    const handleHashChange = () => {
      const newHash = window.location.hash.replace('#', '');
      if (newHash && ['my-projects', 'projects', 'bidding', 'news', 'calendar'].includes(newHash)) {
        setActiveTab(newHash);
      } else {
        setActiveTab('my-projects');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [navigate]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin mb-4"></i>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">연구소 관리 시스템</h1>
          <p className="text-gray-600">
            {user.role === 'admin' ? '관리자' : '연구원'} 대시보드에 오신 것을 환영합니다.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-0 overflow-x-auto">
              <button
                onClick={() => handleTabChange('my-projects')}
                className={`flex-shrink-0 py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'my-projects'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <i className="ri-user-star-line mr-2"></i>
                내 프로젝트
              </button>
              <button
                onClick={() => handleTabChange('projects')}
                className={`flex-shrink-0 py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'projects'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <i className="ri-folder-line mr-2"></i>
                프로젝트 관리
              </button>
              <button
                onClick={() => handleTabChange('bidding')}
                className={`flex-shrink-0 py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'bidding'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <i className="ri-auction-line mr-2"></i>
                입찰공고
              </button>
              <button
                onClick={() => handleTabChange('news')}
                className={`flex-shrink-0 py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'news'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <i className="ri-news-line mr-2"></i>
                IT/AI 뉴스
              </button>
              <button
                onClick={() => handleTabChange('calendar')}
                className={`flex-shrink-0 py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'calendar'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <i className="ri-calendar-line mr-2"></i>
                캘린더
              </button>
              <a
                href="https://qubicom.co.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 py-4 px-6 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 font-medium text-sm whitespace-nowrap transition-all duration-200"
              >
                <i className="ri-external-link-line mr-2"></i>
                Qubicom 바로가기
              </a>
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'my-projects' && <MyProjects user={user} />}
            {activeTab === 'projects' && <ProjectManagement user={user} />}
            {activeTab === 'bidding' && <BiddingNotices />}
            {activeTab === 'news' && <NewsSection />}
            {activeTab === 'calendar' && <Calendar user={user} />}
          </div>
        </div>
      </main>
    </div>
  );
}
