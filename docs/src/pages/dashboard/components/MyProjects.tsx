
import { useState, useEffect } from 'react';
import { 
  getFavoriteProjects, 
  subscribeToFavorites, 
  uploadSimpleFile,
  getAllSimpleFiles,
  deleteSimpleFile,
  subscribeToSimpleFiles,
  PublicFile
} from '../../../lib/supabase';

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

interface MyProjectsProps {
  user: User;
}

export default function MyProjects({ user }: MyProjectsProps) {
  const [favoriteProjects, setFavoriteProjects] = useState([]);
  const [files, setFiles] = useState<PublicFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();

    // 실시간 구독
    const unsubscribeFiles = subscribeToSimpleFiles((updatedFiles) => {
      setFiles(updatedFiles);
    });

    const unsubscribeFavorites = subscribeToFavorites(user.id, async () => {
      const projects = await getFavoriteProjects(user.id);
      setFavoriteProjects(projects);
    });

    return () => {
      unsubscribeFiles();
      unsubscribeFavorites();
    };
  }, [user.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projects, allFiles] = await Promise.all([
        getFavoriteProjects(user.id),
        getAllSimpleFiles()
      ]);
      setFavoriteProjects(projects);
      setFiles(allFiles);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name}은 10MB를 초과합니다.`);
        continue;
      }
      
      await uploadSimpleFile(file, user.name);
    }
    
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (confirm('파일을 삭제하시겠습니까?')) {
      await deleteSimpleFile(fileId);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'ri-image-line';
    if (fileType.includes('pdf')) return 'ri-file-pdf-line';
    if (fileType.includes('word')) return 'ri-file-word-line';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'ri-file-excel-line';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'ri-file-ppt-line';
    if (fileType.startsWith('video/')) return 'ri-video-line';
    if (fileType.startsWith('audio/')) return 'ri-music-line';
    return 'ri-file-line';
  };

  const filteredFiles = files.filter(file => 
    file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <i className="ri-loader-4-line text-3xl text-blue-600 animate-spin"></i>
        <span className="ml-2 text-gray-600">데이터를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 즐겨찾기 프로젝트 섹션 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <i className="ri-star-fill mr-2 text-yellow-500"></i>
          즐겨찾기 프로젝트
        </h3>
        
        {favoriteProjects.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <i className="ri-star-line text-4xl text-gray-300 mb-2"></i>
            <p className="text-gray-600 mb-2">즐겨찾기한 프로젝트가 없습니다</p>
            <p className="text-sm text-gray-500">프로젝트 관리에서 별표를 클릭하여 즐겨찾기를 추가하세요</p>
          </div>
        ) : (
          <div className="grid gap-4 mb-6">
            {favoriteProjects.map((project: any) => (
              <div key={project.id} className="bg-white border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="font-medium text-gray-900 mr-2">{project.title}</h4>
                      <i className="ri-star-fill text-yellow-500 text-sm"></i>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                    {project.start_date && project.end_date && (
                      <div className="flex items-center text-xs text-gray-500">
                        <i className="ri-calendar-line mr-1"></i>
                        <span>{new Date(project.start_date).toLocaleDateString()} ~ {new Date(project.end_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 ml-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.status === 'completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status === 'completed' ? '완료' :
                       project.status === 'in_progress' ? '진행중' :
                       project.status === 'planning' ? '기획' : '보류'}
                    </span>
                    <div className="text-sm font-medium text-gray-900">{project.progress}%</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        project.progress < 25 ? 'bg-red-500' :
                        project.progress < 50 ? 'bg-yellow-500' :
                        project.progress < 75 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 파일 저장소 섹션 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            <i className="ri-folder-shared-line mr-2 text-blue-500"></i>
            파일 저장소
          </h3>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <i className="ri-information-line text-blue-600 mr-2"></i>
            <p className="text-sm text-blue-800">
              <strong>공용 파일 저장소:</strong> 업로드한 파일이 저장되고 모든 사용자가 확인할 수 있습니다.
            </p>
          </div>
        </div>
        
        {/* 검색 */}
        <div className="mb-4">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="파일 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* 드래그 앤 드롭 영역 */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 mb-6 ${
            dragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <div className="flex items-center justify-center">
              <i className="ri-loader-4-line text-2xl text-blue-600 animate-spin mr-2"></i>
              <span className="text-gray-600">파일 업로드 중...</span>
            </div>
          ) : (
            <>
              <i className="ri-upload-cloud-2-line text-4xl text-gray-400 mb-4"></i>
              <h4 className="text-lg font-medium text-gray-900 mb-2">파일 업로드</h4>
              <p className="text-gray-600 mb-4">파일을 드래그하여 업로드하거나 클릭하여 선택하세요</p>
              <input
                type="file"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer whitespace-nowrap"
              >
                <i className="ri-folder-open-line mr-2"></i>
                파일 선택
              </label>
              <p className="text-xs text-gray-500 mt-2">최대 10MB까지 업로드 가능</p>
            </>
          )}
        </div>

        {/* 파일 목록 */}
        {filteredFiles.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <i className="ri-file-line text-4xl text-gray-300 mb-2"></i>
            <p className="text-gray-600">
              {searchTerm ? '검색 결과가 없습니다' : '업로드된 파일이 없습니다'}
            </p>
          </div>
        ) : (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">업로드된 파일 ({filteredFiles.length}개)</h4>
            <div className="grid gap-3">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <i className={`${getFileIcon(file.file_type)} text-2xl text-gray-500`}></i>
                    <div>
                      <p className="font-medium text-gray-900">{file.file_name}</p>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>•</span>
                        <span>{new Date(file.created_at).toLocaleDateString()}</span>
                        {file.uploaded_by && (
                          <>
                            <span>•</span>
                            <span>업로드: {file.uploaded_by}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={file.file_url}
                      download={file.file_name}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="다운로드"
                    >
                      <i className="ri-download-line"></i>
                    </a>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
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
    </div>
  );
}
