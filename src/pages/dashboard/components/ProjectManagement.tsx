
import { useState, useEffect } from 'react';
import { getProjects, createProject, updateProject, deleteProject, subscribeToProjects, Project, updateProjectsOrder, getUserFavorites, addToFavorites, removeFromFavorites, subscribeToFavorites } from '../../../lib/supabase';
import ProjectDetail from './ProjectDetail';

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

interface ProjectManagementProps {
  user: User;
}

export default function ProjectManagement({ user }: ProjectManagementProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'planning',
    progress: 0,
    start_date: '',
    end_date: '',
    budget: '',
    manager: '',
    team_members: '',
    priority: 'medium'
  });

  // 프로젝트 목록 로드
  const loadProjects = async () => {
    setLoading(true);
    const data = await getProjects(user.id); // userId 전달하여 즐겨찾기 우선 정렬
    setProjects(data);
    setLoading(false);
  };

  // 즐겨찾기 목록 로드
  const loadFavorites = async () => {
    const favorites = await getUserFavorites(user.id);
    setFavoriteIds(favorites);
  };

  useEffect(() => {
    loadProjects();
    loadFavorites();

    // 실시간 구독
    const unsubscribeProjects = subscribeToProjects((updatedProjects) => {
      setProjects(updatedProjects);
    }, user.id); // userId 전달

    const unsubscribeFavorites = subscribeToFavorites(user.id, (updatedFavoriteIds) => {
      setFavoriteIds(updatedFavoriteIds);
    });

    return () => {
      unsubscribeProjects();
      unsubscribeFavorites();
    };
  }, [user.id]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'planning',
      progress: 0,
      start_date: '',
      end_date: '',
      budget: '',
      manager: '',
      team_members: '',
      priority: 'medium'
    });
    setEditingProject(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectData = {
      title: formData.title,
      description: formData.description || null,
      status: formData.status,
      progress: Number(formData.progress),
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      budget: formData.budget ? Number(formData.budget) : null,
      manager: formData.manager || null,
      team_members: formData.team_members ? formData.team_members.split(',').map(m => m.trim()) : null,
      priority: formData.priority,
      sort_order: editingProject ? editingProject.sort_order : projects.length
    };

    try {
      if (editingProject) {
        await updateProject(editingProject.id, projectData);
      } else {
        await createProject(projectData);
      }
      resetForm();
    } catch (error) {
      console.error('프로젝트 저장 오류:', error);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      status: project.status,
      progress: project.progress,
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      budget: project.budget?.toString() || '',
      manager: project.manager || '',
      team_members: project.team_members?.join(', ') || '',
      priority: project.priority
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      await deleteProject(id);
    }
  };

  const handleToggleFavorite = async (projectId: string) => {
    try {
      if (favoriteIds.includes(projectId)) {
        await removeFromFavorites(user.id, projectId);
        setFavoriteIds(prev => prev.filter(id => id !== projectId));
      } else {
        await addToFavorites(user.id, projectId);
        setFavoriteIds(prev => [...prev, projectId]);
      }
      // 즐겨찾기 상태 변경 후 프로젝트 목록 새로고침
      await loadProjects();
    } catch (error) {
      console.error('즐겨찾기 처리 오류:', error);
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newProjects = [...projects];
    const draggedProject = newProjects[draggedIndex];
    
    // 배열에서 드래그된 항목 제거
    newProjects.splice(draggedIndex, 1);
    // 새 위치에 삽입
    newProjects.splice(dropIndex, 0, draggedProject);

    // sort_order 업데이트
    const updates = newProjects.map((project, index) => ({
      id: project.id,
      sort_order: index
    }));

    setProjects(newProjects);
    await updateProjectsOrder(updates);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planning: { color: 'bg-yellow-100 text-yellow-800', text: '기획' },
      in_progress: { color: 'bg-blue-100 text-blue-800', text: '진행중' },
      completed: { color: 'bg-green-100 text-green-800', text: '완료' },
      on_hold: { color: 'bg-gray-100 text-gray-800', text: '보류' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planning;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <i className="ri-loader-4-line text-3xl text-blue-600 animate-spin"></i>
        <span className="ml-2 text-gray-600">프로젝트를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">프로젝트 관리</h2>
          <p className="text-sm text-gray-600 mt-1">
            모든 접속자가 공유하는 프로젝트 관리 시스템 (드래그로 순서 변경 가능)
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap"
        >
          <i className="ri-add-line mr-2"></i>
          새 프로젝트
        </button>
      </div>

      {/* 프로젝트 생성/수정 폼 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {editingProject ? '프로젝트 수정' : '새 프로젝트 생성'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      프로젝트명 *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="프로젝트명을 입력하세요"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      담당자
                    </label>
                    <input
                      type="text"
                      value={formData.manager}
                      onChange={(e) => setFormData({...formData, manager: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="담당자명"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상태
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    >
                      <option value="planning">기획</option>
                      <option value="in_progress">진행중</option>
                      <option value="completed">완료</option>
                      <option value="on_hold">보류</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      우선순위
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    >
                      <option value="low">낮음</option>
                      <option value="medium">보통</option>
                      <option value="high">높음</option>
                      <option value="urgent">긴급</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      진행률 (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) => setFormData({...formData, progress: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      예산
                    </label>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="예산 (원)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시작일
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      종료일
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    팀원 (쉼표로 구분)
                  </label>
                  <input
                    type="text"
                    value={formData.team_members}
                    onChange={(e) => setFormData({...formData, team_members: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="홍길동, 김철수, 이영희"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    설명
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="프로젝트 설명을 입력하세요"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap"
                  >
                    {editingProject ? '수정' : '생성'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 프로젝트 상세 모달 */}
      {selectedProject && (
        <ProjectDetail 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <i className="ri-folder-open-line text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">프로젝트가 없습니다</h3>
          <p className="text-gray-600 mb-6">첫 번째 프로젝트를 생성해보세요.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap"
          >
            <i className="ri-add-line mr-2"></i>
            새 프로젝트 생성
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {projects.map((project, index) => (
            <div 
              key={project.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={`bg-white border rounded-lg p-6 hover:shadow-md transition-all duration-200 cursor-move ${
                dragOverIndex === index ? 'border-blue-500 shadow-lg' : ''
              } ${draggedIndex === index ? 'opacity-50' : ''} ${
                favoriteIds.includes(project.id) ? 'border-yellow-200 bg-yellow-50' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={() => handleProjectClick(project)}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 cursor-pointer text-left"
                    >
                      {project.title}
                    </button>
                    {getStatusBadge(project.status)}
                    {getPriorityBadge(project.priority)}
                    {favoriteIds.includes(project.id) && (
                      <div className="flex items-center">
                        <i className="ri-star-fill text-yellow-500 mr-1"></i>
                        <span className="text-yellow-600 text-xs font-medium">즐겨찾기</span>
                      </div>
                    )}
                  </div>
                  
                  {project.description && (
                    <p className="text-gray-600 mb-4">{project.description}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {project.manager && (
                      <div className="flex items-center text-sm">
                        <i className="ri-user-line text-gray-400 mr-2"></i>
                        <span className="text-gray-600">담당자:</span>
                        <span className="ml-1 font-medium">{project.manager}</span>
                      </div>
                    )}
                    
                    {project.budget && (
                      <div className="flex items-center text-sm">
                        <i className="ri-money-dollar-circle-line text-gray-400 mr-2"></i>
                        <span className="text-gray-600">예산:</span>
                        <span className="ml-1 font-medium">{project.budget.toLocaleString()}원</span>
                      </div>
                    )}
                    
                    {project.start_date && (
                      <div className="flex items-center text-sm">
                        <i className="ri-calendar-line text-gray-400 mr-2"></i>
                        <span className="text-gray-600">시작:</span>
                        <span className="ml-1 font-medium">{new Date(project.start_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {project.end_date && (
                      <div className="flex items-center text-sm">
                        <i className="ri-calendar-check-line text-gray-400 mr-2"></i>
                        <span className="text-gray-600">종료:</span>
                        <span className="ml-1 font-medium">{new Date(project.end_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">진행률</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {project.team_members && project.team_members.length > 0 && (
                    <div className="flex items-center text-sm">
                      <i className="ri-team-line text-gray-400 mr-2"></i>
                      <span className="text-gray-600">팀원:</span>
                      <div className="ml-2 flex flex-wrap gap-1">
                        {project.team_members.map((member, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(project.id);
                    }}
                    className={`p-2 rounded-full transition-colors duration-200 ${
                      favoriteIds.includes(project.id)
                        ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-100'
                        : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                    }`}
                    title={favoriteIds.includes(project.id) ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                  >
                    <i className={favoriteIds.includes(project.id) ? 'ri-star-fill' : 'ri-star-line'}></i>
                  </button>
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="수정"
                  >
                    <i className="ri-edit-line"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="삭제"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
