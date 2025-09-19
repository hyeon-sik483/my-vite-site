
import { useState, useEffect } from 'react';

interface BiddingNotice {
  id: string;
  title: string;
  organization: string;
  category: string;
  amount: string;
  deadline: string;
  announcementDate: string;
  status: 'active' | 'closed';
  link: string;
}

export default function BiddingNotices() {
  const [notices, setNotices] = useState<BiddingNotice[]>([]);
  const [filteredNotices, setFilteredNotices] = useState<BiddingNotice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadNotices();
  }, []);

  useEffect(() => {
    filterNotices();
  }, [notices, searchTerm, selectedCategory]);

  const loadNotices = () => {
    // 통신, 네트워크, 무선, 5G 관련 샘플 데이터
    const sampleNotices: BiddingNotice[] = [
      {
        id: '1',
        title: '5G 네트워크 인프라 구축 및 운영 사업',
        organization: '과학기술정보통신부',
        category: '통신/네트워크',
        amount: '250억원',
        deadline: '2024-03-15',
        announcementDate: '2024-02-15',
        status: 'active',
        link: 'https://www.g2b.go.kr/'
      },
      {
        id: '2',
        title: '무선통신 보안시스템 개발 및 구축',
        organization: '국방부',
        category: '무선/보안',
        amount: '180억원',
        deadline: '2024-03-20',
        announcementDate: '2024-02-20',
        status: 'active',
        link: 'https://www.g2b.go.kr/'
      },
      {
        id: '3',
        title: '차세대 5G 기반 스마트시티 플랫폼 구축',
        organization: '서울특별시',
        category: '5G/스마트시티',
        amount: '320억원',
        deadline: '2024-03-25',
        announcementDate: '2024-02-25',
        status: 'active',
        link: 'https://www.g2b.go.kr/'
      },
      {
        id: '4',
        title: '네트워크 보안 솔루션 고도화 사업',
        organization: '한국인터넷진흥원',
        category: '네트워크/보안',
        amount: '95억원',
        deadline: '2024-04-01',
        announcementDate: '2024-03-01',
        status: 'active',
        link: 'https://www.g2b.go.kr/'
      },
      {
        id: '5',
        title: '무선 IoT 통신망 구축 및 운영',
        organization: '부산광역시',
        category: '무선/IoT',
        amount: '140억원',
        deadline: '2024-04-05',
        announcementDate: '2024-03-05',
        status: 'active',
        link: 'https://www.g2b.go.kr/'
      },
      {
        id: '6',
        title: '5G 기반 자율주행 테스트베드 구축',
        organization: '국토교통부',
        category: '5G/자율주행',
        amount: '450억원',
        deadline: '2024-04-10',
        announcementDate: '2024-03-10',
        status: 'active',
        link: 'https://www.g2b.go.kr/'
      },
      {
        id: '7',
        title: '통신장비 현대화 사업',
        organization: '한국전력공사',
        category: '통신/인프라',
        amount: '200억원',
        deadline: '2024-02-28',
        announcementDate: '2024-01-28',
        status: 'closed',
        link: 'https://www.g2b.go.kr/'
      },
      {
        id: '8',
        title: '네트워크 운영센터(NOC) 구축',
        organization: 'LG유플러스',
        category: '네트워크/운영',
        amount: '85억원',
        deadline: '2024-04-15',
        announcementDate: '2024-03-15',
        status: 'active',
        link: 'https://www.g2b.go.kr/'
      }
    ];
    setNotices(sampleNotices);
  };

  const filterNotices = () => {
    let filtered = notices;

    if (searchTerm) {
      filtered = filtered.filter(notice =>
        notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.organization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(notice => notice.category === selectedCategory);
    }

    setFilteredNotices(filtered);
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? '진행중' : '마감';
  };

  const categories = [
    'all',
    '통신/네트워크',
    '무선/보안',
    '5G/스마트시티',
    '네트워크/보안',
    '무선/IoT',
    '5G/자율주행',
    '통신/인프라',
    '네트워크/운영'
  ];

  const getCategoryText = (category: string) => {
    return category === 'all' ? '전체' : category;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">나라장터 입찰공고</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <i className="ri-refresh-line"></i>
          <span className="hidden sm:inline">매일 오전 9시 자동 업데이트</span>
          <span className="sm:hidden">매일 자동 업데이트</span>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="통신, 네트워크, 무선, 5G 관련 공고 검색..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {getCategoryText(category)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 모바일 친화적인 카드 레이아웃 */}
      <div className="block sm:hidden space-y-4">
        {filteredNotices.map((notice) => (
          <div key={notice.id} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900 text-sm leading-5 pr-2">
                {notice.title}
              </h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(notice.status)}`}>
                {getStatusText(notice.status)}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">발주기관:</span>
                <span className="text-gray-900 text-right">{notice.organization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">분류:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {notice.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">예산:</span>
                <span className="font-semibold text-gray-900">{notice.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">마감일:</span>
                <span className="text-gray-900">{notice.deadline}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-3 border-t">
              <span className="text-xs text-gray-500">공고일: {notice.announcementDate}</span>
              <a
                href={notice.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <i className="ri-external-link-line mr-1"></i>
                상세보기
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* 데스크톱 테이블 레이아웃 */}
      <div className="hidden sm:block bg-white border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  공고명
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  발주기관
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  분류
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  예산
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  마감일
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  링크
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredNotices.map((notice) => (
                <tr key={notice.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 line-clamp-2">
                      {notice.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      공고일: {notice.announcementDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {notice.organization}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {notice.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {notice.amount}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {notice.deadline}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(notice.status)}`}>
                      {getStatusText(notice.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={notice.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors duration-200"
                    >
                      <i className="ri-external-link-line text-lg"></i>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredNotices.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-file-search-line text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      {/* 모바일에서 검색 결과 없음 표시 */}
      {filteredNotices.length === 0 && (
        <div className="block sm:hidden text-center py-12 bg-white border rounded-lg">
          <i className="ri-file-search-line text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
