
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: '"Pacifico", serif' }}>
            연구소 관리 시스템
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            프로젝트 관리, 입찰공고, IT 뉴스까지 한 번에
          </p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium cursor-pointer whitespace-nowrap"
            >
              로그인
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 font-medium cursor-pointer whitespace-nowrap"
            >
              회원가입
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <i className="ri-folder-line text-blue-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">프로젝트 관리</h3>
            <p className="text-gray-600">연구 프로젝트의 진행 상황을 체계적으로 관리하고 실적을 기록합니다.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <i className="ri-file-text-line text-green-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">입찰공고 모니터링</h3>
            <p className="text-gray-600">나라장터의 최신 입찰공고를 자동으로 수집하여 제공합니다.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <i className="ri-newspaper-line text-purple-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">IT/AI 뉴스</h3>
            <p className="text-gray-600">주요 IT 매체의 최신 기술 뉴스를 실시간으로 수집합니다.</p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-sm">
            연구소 관리 시스템으로 효율적인 연구 환경을 구축하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
