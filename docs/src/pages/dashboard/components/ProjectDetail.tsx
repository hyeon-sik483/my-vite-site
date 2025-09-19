import { Project } from '../../../lib/supabase';

interface ProjectDetailProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectDetail({ project, onClose }: ProjectDetailProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planning: { color: 'bg-yellow-100 text-yellow-800', text: '기획' },
      in_progress: { color: 'bg-blue-100 text-blue-800', text: '진행중' },
      completed: { color: 'bg-green-100 text-green-800', text: '완료' },
      on_hold: { color: 'bg-gray-100 text-gray-800', text: '보류' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planning;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-800', text: '낮음' },
      medium: { color: 'bg-blue-100 text-blue-800', text: '보통' },
      high: { color: 'bg-orange-100 text-orange-800', text: '높음' },
      urgent: { color: 'bg-red-100 text-red-800', text: '긴급' }
    };
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getProgressColor = (progress: number) => {
    if (progress < 25) return 'bg-red-500';
    if (progress < 50) return 'bg-yellow-500';
    if (progress < 75) return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
              {getStatusBadge(project.status)}
              {getPriorityBadge(project.priority)}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>

          {/* 진행률 */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">전체 진행률</span>
              <span className="font-bold text-lg">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>

          {/* 프로젝트 정보 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* 기본 정보 */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                <i className="ri-information-line mr-2"></i>
                기본 정보
              </h3>
              
              {project.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">프로젝트 설명</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{project.description}</p>
                </div>
              )}

              {project.manager && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="ri-user-line mr-1"></i>
                    담당자
                  </label>
                  <p className="text-gray-900 font-medium">{project.manager}</p>
                </div>
              )}

              {project.team_members && project.team_members.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="ri-team-line mr-1"></i>
                    팀원
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {project.team_members.map((member, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 일정 및 예산 */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                <i className="ri-calendar-line mr-2"></i>
                일정 & 예산
              </h3>

              {project.start_date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="ri-play-line mr-1"></i>
                    시작일
                  </label>
                  <p className="text-gray-900 font-medium">{new Date(project.start_date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short'
                  })}</p>
                </div>
              )}

              {project.end_date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="ri-stop-line mr-1"></i>
                    종료일
                  </label>
                  <p className="text-gray-900 font-medium">{new Date(project.end_date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short'
                  })}</p>
                </div>
              )}

              {project.start_date && project.end_date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="ri-time-line mr-1"></i>
                    프로젝트 기간
                  </label>
                  <p className="text-gray-900 font-medium">
                    {Math.ceil((new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) / (1000 * 60 * 60 * 24))}일
                  </p>
                </div>
              )}

              {project.budget && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="ri-money-dollar-circle-line mr-1"></i>
                    예산
                  </label>
                  <p className="text-gray-900 font-bold text-lg">{project.budget.toLocaleString()}원</p>
                </div>
              )}
            </div>
          </div>

          {/* 생성/수정 정보 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">생성일:</span>
                <span className="ml-2 font-medium">{new Date(project.created_at).toLocaleString('ko-KR')}</span>
              </div>
              <div>
                <span className="text-gray-600">최종 수정:</span>
                <span className="ml-2 font-medium">{new Date(project.updated_at).toLocaleString('ko-KR')}</span>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 whitespace-nowrap"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}