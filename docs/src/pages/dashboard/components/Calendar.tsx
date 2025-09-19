
import { useState, useEffect } from 'react';
import { 
  getUserEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  subscribeToUserEvents,
  getProjects,
  getUserFavorites,
  subscribeToFavorites,
  Event,
  Project 
} from '../../../lib/supabase';

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

interface CalendarProps {
  user: User;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  events: Event[];
  projectEvents: Project[];
}

interface ProjectNote {
  id: string;
  user_id: string;
  project_id: string;
  date: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export default function Calendar({ user }: CalendarProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    loadData();

    // 실시간 구독
    const unsubscribeEvents = subscribeToUserEvents(user.id, (updatedEvents) => {
      setEvents(updatedEvents);
    });

    const unsubscribeFavorites = subscribeToFavorites(user.id, (updatedFavoriteIds) => {
      setFavoriteIds(updatedFavoriteIds);
    });

    return () => {
      unsubscribeEvents();
      unsubscribeFavorites();
    };
  }, [user.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userEvents, allProjects, userFavorites] = await Promise.all([
        getUserEvents(user.id),
        getProjects(),
        getUserFavorites(user.id)
      ]);
      setEvents(userEvents);
      setProjects(allProjects);
      setFavoriteIds(userFavorites);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dateStr = currentDay.toISOString().split('T')[0];
      
      // 개인 일정 필터링
      const dayEvents = events.filter(event => {
        const eventStart = new Date(event.start_date);
        const eventEnd = new Date(event.end_date);
        return currentDay >= eventStart && currentDay <= eventEnd;
      });

      // 즐겨찾기 프로젝트만 필터링
      const favoriteProjects = projects.filter(project => {
        if (!favoriteIds.includes(project.id)) return false;
        if (!project.start_date || !project.end_date) return false;
        const projectStart = new Date(project.start_date);
        const projectEnd = new Date(project.end_date);
        return currentDay >= projectStart && currentDay <= projectEnd;
      });
      
      days.push({
        date: new Date(currentDay),
        isCurrentMonth: currentDay.getMonth() === month,
        events: dayEvents,
        projectEvents: favoriteProjects
      });
      
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowDateModal(true);
  };

  const handleCreateEvent = () => {
    if (!selectedDate) return;
    setFormData({
      title: '',
      description: '',
      start_date: selectedDate.toISOString().split('T')[0],
      end_date: selectedDate.toISOString().split('T')[0]
    });
    setShowDateModal(false);
    setShowEventForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData = {
      user_id: user.id,
      title: formData.title,
      description: formData.description || null,
      start_date: formData.start_date,
      end_date: formData.end_date
    };

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
      } else {
        await createEvent(eventData);
      }
      resetForm();
    } catch (error) {
      console.error('일정 저장 오류:', error);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      start_date: event.start_date,
      end_date: event.end_date
    });
    setShowDateModal(false);
    setShowEventForm(true);
  };

  const handleDelete = async (eventId: string) => {
    if (confirm('일정을 삭제하시겠습니까?')) {
      await deleteEvent(eventId);
      setShowDateModal(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start_date: '',
      end_date: ''
    });
    setEditingEvent(null);
    setShowEventForm(false);
    setSelectedDate(null);
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getProjectColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500'
    ];
    return colors[index % colors.length];
  };

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  const days = getDaysInMonth(currentDate);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <i className="ri-loader-4-line text-3xl text-blue-600 animate-spin"></i>
        <span className="ml-2 text-gray-600">캘린더를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">캘린더</h2>
          <p className="text-sm text-gray-600 mt-1">
            개인 일정 관리 및 즐겨찾기 프로젝트 일정 확인
          </p>
        </div>
        <button
          onClick={() => setShowEventForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap"
        >
          <i className="ri-add-line mr-2"></i>
          일정 추가
        </button>
      </div>

      {/* 일정 생성/수정 폼 */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {editingEvent ? '일정 수정' : '새 일정 추가'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    일정 제목 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="일정 제목을 입력하세요"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시작일 *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      종료일 *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
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
                    placeholder="일정 설명을 입력하세요"
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
                    {editingEvent ? '수정' : '추가'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 날짜 상세 모달 */}
      {showDateModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {selectedDate.toLocaleDateString('ko-KR')} 일정
                </h3>
                <button
                  onClick={() => setShowDateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                {/* 해당 날짜의 개인 일정 */}
                {days.find(day => day.date.toDateString() === selectedDate.toDateString())?.events.map((event) => (
                  <div key={event.id} className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-blue-900">{event.title}</h4>
                        <p className="text-sm text-blue-600">
                          {new Date(event.start_date).toLocaleDateString()} ~ {new Date(event.end_date).toLocaleDateString()}
                        </p>
                        {event.description && (
                          <p className="text-sm text-blue-700 mt-1">{event.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEdit(event)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <i className="ri-edit-line text-sm"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <i className="ri-delete-bin-line text-sm"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 해당 날짜의 프로젝트 일정 */}
                {days.find(day => day.date.toDateString() === selectedDate.toDateString())?.projectEvents.map((project, index) => (
                  <div key={project.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${getProjectColor(index)}`}></div>
                      <div>
                        <h4 className="font-medium text-gray-900">📋 {project.title}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(project.start_date!).toLocaleDateString()} ~ {new Date(project.end_date!).toLocaleDateString()}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                            진행률: {project.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 일정이 없을 때 */}
                {!days.find(day => day.date.toDateString() === selectedDate.toDateString())?.events.length && 
                 !days.find(day => day.date.toDateString() === selectedDate.toDateString())?.projectEvents.length && (
                  <div className="text-center py-4 text-gray-500">
                    이 날에는 일정이 없습니다.
                  </div>
                )}

                <button
                  onClick={handleCreateEvent}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap"
                >
                  <i className="ri-add-line mr-2"></i>
                  새 일정 추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 캘린더 헤더 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 whitespace-nowrap"
            >
              오늘
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </div>

        {/* 캘린더 그리드 */}
        <div className="p-4">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map((day, index) => (
              <div key={day} className={`p-2 text-sm font-medium text-center ${
                index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
              }`}>
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <div
                key={index}
                className={`min-h-[100px] p-1 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                  !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                } ${isToday(day.date) ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleDateClick(day.date)}
              >
                <div className={`text-sm font-medium mb-1 ${
                  day.date.getDay() === 0 ? 'text-red-600' : 
                  day.date.getDay() === 6 ? 'text-blue-600' : 
                  'text-gray-900'
                }`}>
                  {day.date.getDate()}
                </div>
                
                {/* 개인 일정 표시 */}
                {day.events.slice(0, 1).map((event) => (
                  <div
                    key={event.id}
                    className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded mb-1 truncate"
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}

                {/* 프로젝트 일정 표시 (최대 3개) */}
                {day.projectEvents.slice(0, 3).map((project, projectIndex) => (
                  <div
                    key={`project-${project.id}`}
                    className="flex items-center mb-1"
                  >
                    <div className={`w-2 h-2 rounded-full mr-1 ${getProjectColor(projectIndex)}`}></div>
                    <div className="text-xs text-gray-700 truncate flex-1" title={project.title}>
                      {project.title}
                    </div>
                  </div>
                ))}

                {/* 더 많은 일정이 있을 때 */}
                {(day.events.length + day.projectEvents.length) > 4 && (
                  <div className="text-xs text-gray-500">
                    +{(day.events.length + day.projectEvents.length) - 4}개 더
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 일정 목록 */}
      {events.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">내 일정</h3>
          </div>
          <div className="p-4 space-y-3">
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(event.start_date).toLocaleDateString()} ~ {new Date(event.end_date).toLocaleDateString()}
                  </p>
                  {event.description && (
                    <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="수정"
                  >
                    <i className="ri-edit-line"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="삭제"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}