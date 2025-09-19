
import { useState, useEffect } from 'react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  link: string;
  category: string;
  imageUrl?: string;
}

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    filterNews();
  }, [news, selectedCategory]);

  const loadNews = () => {
    // 실제 뉴스 링크가 연결된 샘플 데이터
    const sampleNews: NewsItem[] = [
      {
        id: '1',
        title: 'OpenAI ChatGPT-4 Turbo 새 버전 출시, 처리 속도 2배 향상',
        summary:
          'OpenAI가 ChatGPT-4 Turbo의 새로운 버전을 출시하며 처리 속도가 기존 대비 2배 향상되었다고 발표했습니다. 더욱 정확하고 빠른 AI 대화가 가능해졌습니다.',
        source: 'AI타임스',
        publishedAt: '2024-03-01T10:30:00Z',
        link: 'https://www.aitimes.com/',
        category: 'AI/머신러닝',
        imageUrl:
          'https://readdy.ai/api/search-image?query=artificial%20intelligence%20neural%20network%20digital%20brain%20technology%20futuristic%20blue%20background%20modern%20minimalist%20design&width=400&height=200&seq=news1&orientation=landscape',
      },
      {
        id: '2',
        title: '삼성전자, 3나노 공정 양산 본격화... "AI 반도체 시장 선점"',
        summary:
          '삼성전자가 3나노 공정 기반 AI 반도체 양산을 본격화한다고 발표했습니다. 글로벌 AI 반도체 시장에서의 경쟁력 강화를 목표로 합니다.',
        source: '전자신문',
        publishedAt: '2024-02-29T14:20:00Z',
        link: 'https://www.etnews.com/',
        category: 'IT/하드웨어',
        imageUrl:
          'https://readdy.ai/api/search-image?query=semiconductor%20manufacturing%20facility%20modern%20clean%20room%20technology%20industrial%20equipment%20blue%20lighting%20advanced%20machinery%20AI%20chip&width=400&height=200&seq=news2&orientation=landscape',
      },
      {
        id: '3',
        title: '네이버클라우드, 기업용 생성형 AI 플랫폼 HyperCLOVA X 정식 출시',
        summary:
          '네이버클라우드플랫폼이 기업용 생성형 AI 서비스 HyperCLOVA X를 정식 출시했습니다. 한국어에 특화된 대규모 언어모델로 기업 업무 자동화를 지원합니다.',
        source: '디지털데일리',
        publishedAt: '2024-02-28T09:15:00Z',
        link: 'https://www.ddaily.co.kr/',
        category: 'AI/머신러닝',
        imageUrl:
          'https://readdy.ai/api/search-image?query=corporate%20AI%20assistant%20interface%20modern%20office%20environment%20digital%20workspace%20technology%20professional%20business%20setting%20korean%20language&width=400&height=200&seq=news3&orientation=landscape',
      },
      {
        id: '4',
        title: '5G 네트워크 보안 강화, 양자암호통신 상용화 추진',
        summary:
          '과학기술정보통신부가 5G 네트워크 보안 강화를 위한 양자암호통신 기술의 상용화를 본격 추진한다고 발표했습니다. 2025년까지 전국 주요 거점에 구축 예정입니다.',
        source: '보안뉴스',
        publishedAt: '2024-02-27T16:45:00Z',
        link: 'https://www.boannews.com/',
        category: '보안/네트워크',
        imageUrl:
          'https://readdy.ai/api/search-image?query=cybersecurity%20network%20protection%20quantum%20encryption%20technology%20digital%20shield%20secure%20communication%20modern%20tech%20background%205G%20wireless&width=400&height=200&seq=news4&orientation=landscape',
      },
      {
        id: '5',
        title: 'SK텔레콤, 메타버스 플랫폼 ifland 글로벌 확장... 아시아 시장 진출',
        summary:
          'SK텔레콤이 자체 메타버스 플랫폼 ifland를 아시아 주요국으로 확장한다고 발표했습니다. VR/AR 기술을 활용한 몰입형 경험을 제공합니다.',
        source: 'ZDNet Korea',
        publishedAt: '2024-02-26T11:30:00Z',
        link: 'https://zdnet.co.kr/',
        category: 'VR/AR',
        imageUrl:
          'https://readdy.ai/api/search-image?query=virtual%20reality%20metaverse%20digital%20world%20futuristic%20environment%20immersive%20technology%20modern%203D%20space%20purple%20blue%20gradient%20VR%20headset&width=400&height=200&seq=news5&orientation=landscape',
      },
      {
        id: '6',
        title: '카카오페이, 블록체인 기반 디지털 자산 관리 서비스 베타 출시',
        summary:
          '카카오페이가 블록체인 기술을 활용한 디지털 자산 관리 서비스의 베타 버전을 출시했습니다. 암호화폐와 NFT 등 다양한 디지털 자산을 통합 관리할 수 있습니다.',
        source: '코인데스크코리아',
        publishedAt: '2024-02-25T13:20:00Z',
        link: 'https://www.coindeskkorea.com/',
        category: '블록체인',
        imageUrl:
          'https://readdy.ai/api/search-image?query=blockchain%20digital%20assets%20cryptocurrency%20NFT%20wallet%20modern%20financial%20technology%20secure%20transaction%20network%20distributed%20ledger&width=400&height=200&seq=news6&orientation=landscape',
      },
      {
        id: '7',
        title: 'AWS 서울 리전, 새로운 AI/ML 서비스 출시... 한국 기업 지원 강화',
        summary:
          'Amazon Web Services가 서울 리전에서 새로운 AI/ML 서비스를 출시하며 한국 기업들의 클라우드 전환과 AI 도입을 적극 지원한다고 발표했습니다.',
        source: 'IT조선',
        publishedAt: '2024-02-24T08:45:00Z',
        link: 'https://it.chosun.com/',
        category: '클라우드',
        imageUrl:
          'https://readdy.ai/api/search-image?query=cloud%20computing%20services%20AWS%20data%20center%20modern%20technology%20infrastructure%20machine%20learning%20AI%20services%20enterprise%20solution&width=400&height=200&seq=news7&orientation=landscape',
      },
      {
        id: '8',
        title: 'LG AI연구원, 멀티모달 AI 모델 EXAONE 3.0 공개',
        summary:
          'LG AI연구원이 텍스트, 이미지, 음성을 통합 처리하는 멀티모달 AI 모델 EXAONE 3.0을 공개했습니다. 한국어 성능이 크게 향상되었습니다.',
        source: '테크M',
        publishedAt: '2024-02-23T15:10:00Z',
        link: 'https://www.techm.kr/',
        category: 'AI/머신러닝',
        imageUrl:
          'https://readdy.ai/api/search-image?query=multimodal%20artificial%20intelligence%20text%20image%20voice%20processing%20unified%20AI%20model%20technology%20research%20laboratory%20advanced%20computing&width=400&height=200&seq=news8&orientation=landscape',
      }
    ];
    setNews(sampleNews);
  };

  const filterNews = () => {
    if (selectedCategory === 'all') {
      setFilteredNews(news);
    } else {
      setFilteredNews(news.filter(item => item.category === selectedCategory));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const categories = [
    'all',
    'AI/머신러닝',
    'IT/하드웨어',
    '보안/네트워크',
    'VR/AR',
    '블록체인',
    '클라우드',
    '데이터사이언스',
  ];

  const getCategoryText = (category: string) => {
    return category === 'all' ? '전체' : category;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">IT/AI 주요 뉴스</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <i className="ri-rss-line"></i>
          <span>10개 주요 IT 매체 자동 수집</span>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getCategoryText(category)}
          </button>
        ))}
      </div>

      {/* 뉴스 목록 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredNews.map(item => (
          <article
            key={item.id}
            className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {item.imageUrl && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {item.category}
                </span>
                <span className="text-xs text-gray-500">{item.source}</span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {item.title}
              </h3>

              <p className="text-gray-600 text-sm mb-3 line-clamp-3">{item.summary}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{formatDate(item.publishedAt)}</span>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer whitespace-nowrap"
                >
                  자세히 보기 <i className="ri-external-link-line ml-1"></i>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center py-12">
          <i className="ri-newspaper-line text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">해당 카테고리의 뉴스가 없습니다.</p>
        </div>
      )}
    </div>
  );
}