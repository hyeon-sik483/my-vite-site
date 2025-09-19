
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  progress: number;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  manager: string | null;
  team_members: string[] | null;
  priority: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  project_id: string;
  created_at: string;
}

export interface UserFile {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  folder_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

// New public interfaces
export interface PublicFile {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  folder_id?: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PublicFolder {
  id: string;
  name: string;
  parent_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// 사용자 관리 함수들
export const createUser = async (userData: { name: string; email: string; password: string; role: string }): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single();

  if (error) {
    console.error('사용자 생성 오류:', error);
    return null;
  }

  return data;
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .single();

  if (error) {
    console.error('로그인 오류:', error);
    return null;
  }

  return data;
};

// 프로젝트 조회 (즐겨찾기 우선 정렬)
export const getProjects = async (userId?: string): Promise<Project[]> => {
  let query = supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('프로젝트 조회 오류:', error);
    return [];
  }

  // 즐겨찾기 프로젝트를 상단에 고정
  if (userId && isValidUUID(userId)) {
    const favoriteIds = await getUserFavorites(userId);
    const projects = data || [];

    const favoriteProjects = projects.filter(p => favoriteIds.includes(p.id));
    const normalProjects = projects.filter(p => !favoriteIds.includes(p.id));

    return [...favoriteProjects, ...normalProjects];
  }

  return data || [];
};

// 프로젝트 생성
export const createProject = async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project | null> => {
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select()
    .single();

  if (error) {
    console.error('프로젝트 생성 오류:', error);
    return null;
  }

  return data;
};

// 프로젝트 수정
export const updateProject = async (id: string, updates: Partial<Project>): Promise<Project | null> => {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('프로젝트 수정 오류:', error);
    return null;
  }

  return data;
};

// 프로젝트 삭제
export const deleteProject = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('프로젝트 삭제 오류:', error);
    return false;
  }

  return true;
};

// 프로젝트 순서 업데이트
export const updateProjectsOrder = async (projects: { id: string; sort_order: number }[]): Promise<boolean> => {
  const updates = projects.map(p =>
    supabase
      .from('projects')
      .update({ sort_order: p.sort_order, updated_at: new Date().toISOString() })
      .eq('id', p.id)
  );

  try {
    await Promise.all(updates);
    return true;
  } catch (error) {
    console.error('프로젝트 순서 업데이트 오류:', error);
    return false;
  }
};

// 폴더 관리 함수들
export const getUserFolders = async (userId: string): Promise<Folder[]> => {
  if (!userId || !isValidUUID(userId)) {
    return [];
  }

  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) {
    console.error('폴더 조회 오류:', error);
    return [];
  }

  return data || [];
};

export const createFolder = async (userId: string, name: string, parentId?: string): Promise<Folder | null> => {
  if (!userId || !isValidUUID(userId)) {
    return null;
  }

  const folderData = {
    user_id: userId,
    name,
    parent_id: parentId || null
  };

  const { data, error } = await supabase
    .from('folders')
    .insert([folderData])
    .select()
    .single();

  if (error) {
    console.error('폴더 생성 오류:', error);
    return null;
  }

  return data;
};

export const deleteFolder = async (folderId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', folderId);

  if (error) {
    console.error('폴더 삭제 오류:', error);
    return false;
  }

  return true;
};

export const moveFileToFolder = async (fileId: string, folderId?: string): Promise<boolean> => {
  const { error } = await supabase
    .from('user_files')
    .update({ folder_id: folderId || null, updated_at: new Date().toISOString() })
    .eq('id', fileId);

  if (error) {
    console.error('파일 이동 오류:', error);
    return false;
  }

  return true;
};

// 파일 관리
export const getUserFiles = async (userId: string, folderId?: string): Promise<UserFile[]> => {
  if (!userId || !isValidUUID(userId)) {
    return [];
  }

  let query = supabase
    .from('user_files')
    .select('*')
    .eq('user_id', userId);

  if (folderId) {
    query = query.eq('folder_id', folderId);
  } else {
    query = query.is('folder_id', null);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('파일 조회 오류:', error);
    return [];
  }

  return data || [];
};

export const uploadUserFile = async (userId: string, file: File, folderId?: string): Promise<UserFile | null> => {
  if (!userId || !isValidUUID(userId)) {
    return null;
  }

  const reader = new FileReader();

  return new Promise((resolve) => {
    reader.onload = async () => {
      const fileData = {
        user_id: userId,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_url: reader.result as string,
        folder_id: folderId || null
      };

      const { data, error } = await supabase
        .from('user_files')
        .insert([fileData])
        .select()
        .single();

      if (error) {
        console.error('파일 업로드 오류:', error);
        resolve(null);
      } else {
        resolve(data);
      }
    };

    reader.readAsDataURL(file);
  });
};

export const deleteUserFile = async (fileId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('user_files')
    .delete()
    .eq('id', fileId);

  if (error) {
    console.error('파일 삭제 오류:', error);
    return false;
  }

  return true;
};

// 실시간 구독
export const subscribeToProjects = (callback: (projects: Project[]) => void, userId?: string) => {
  const subscription = supabase
    .channel('projects-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'projects' },
      async () => {
        const projects = await getProjects(userId);
        callback(projects);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};

export const subscribeToUserFiles = (userId: string, callback: (files: UserFile[]) => void) => {
  // UUID 형식이 아닌 경우 빈 함수 반환
  if (!userId || !isValidUUID(userId)) {
    return () => {};
  }

  const subscription = supabase
    .channel('user-files-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'user_files' },
      async () => {
        const files = await getUserFiles(userId);
        callback(files);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};

export const subscribeToFavorites = (userId: string, callback: (favoriteIds: string[]) => void) => {
  // UUID 형식이 아닌 경우 빈 함수 반환
  if (!userId || !isValidUUID(userId)) {
    return () => {};
  }

  const subscription = supabase
    .channel('favorites-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'user_favorites' },
      async () => {
        const favoriteIds = await getUserFavorites(userId);
        callback(favoriteIds);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};

export const subscribeToUserFolders = (userId: string, callback: (folders: Folder[]) => void) => {
  if (!userId || !isValidUUID(userId)) {
    return () => {};
  }

  const subscription = supabase
    .channel('user-folders-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'folders' },
      async () => {
        const folders = await getUserFolders(userId);
        callback(folders);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};

export const subscribeToUserEvents = (userId: string, callback: (events: Event[]) => void) => {
  if (!userId || !isValidUUID(userId)) {
    return () => {};
  }

  const subscription = supabase
    .channel('user-events-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'events' },
      async () => {
        const events = await getUserEvents(userId);
        callback(events);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};

// 즐겨찾기 관리
export const getUserFavorites = async (userId: string): Promise<string[]> => {
  // UUID 형식이 아닌 경우 빈 배열 반환
  if (!userId || !isValidUUID(userId)) {
    return [];
  }

  const { data, error } = await supabase
    .from('user_favorites')
    .select('project_id')
    .eq('user_id', userId);

  if (error) {
    console.error('즐겨찾기 조회 오류:', error);
    return [];
  }

  return data.map(item => item.project_id);
};

export const addToFavorites = async (userId: string, projectId: string): Promise<boolean> => {
  // UUID 형식이 아닌 경우 false 반환
  if (!userId || !isValidUUID(userId)) {
    return false;
  }

  const { error } = await supabase
    .from('user_favorites')
    .insert([{ user_id: userId, project_id: projectId }]);

  if (error) {
    console.error('즐겨찾기 추가 오류:', error);
    return false;
  }

  return true;
};

export const removeFromFavorites = async (userId: string, projectId: string): Promise<boolean> => {
  // UUID 형식이 아닌 경우 false 반환
  if (!userId || !isValidUUID(userId)) {
    return false;
  }

  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('project_id', projectId);

  if (error) {
    console.error('즐겨찾기 제거 오류:', error);
    return false;
  }

  return true;
};

export const getFavoriteProjects = async (userId: string): Promise<Project[]> => {
  // UUID 형식이 아닌 경우 빈 배열 반환
  if (!userId || !isValidUUID(userId)) {
    return [];
  }

  const { data, error } = await supabase
    .from('user_favorites')
    .select(`
      projects (*)
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('즐겨찾기 프로젝트 조회 오류:', error);
    return [];
  }

  return data.map(item => item.projects).filter(Boolean) as Project[];
};

// 캘린더 일정 관리 함수들
export const getUserEvents = async (userId: string): Promise<Event[]> => {
  if (!userId || !isValidUUID(userId)) {
    return [];
  }

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('일정 조회 오류:', error);
    return [];
  }

  return data || [];
};

export const createEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event | null> => {
  if (!eventData.user_id || !isValidUUID(eventData.user_id)) {
    return null;
  }

  const { data, error } = await supabase
    .from('events')
    .insert([eventData])
    .select()
    .single();

  if (error) {
    console.error('일정 생성 오류:', error);
    return null;
  }

  return data;
};

export const updateEvent = async (eventId: string, updates: Partial<Event>): Promise<Event | null> => {
  const { data, error } = await supabase
    .from('events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', eventId)
    .select()
    .single();

  if (error) {
    console.error('일정 수정 오류:', error);
    return null;
  }

  return data;
};

export const deleteEvent = async (eventId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (error) {
    console.error('일정 삭제 오류:', error);
    return false;
  }

  return true;
};

// 공용 폴더 관리 함수들
export const getPublicFolders = async (): Promise<PublicFolder[]> => {
  const { data, error } = await supabase
    .from('public_folders')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('공용 폴더 조회 오류:', error);
    return [];
  }

  return data || [];
};

export const createPublicFolder = async (name: string, parentId?: string, createdBy?: string): Promise<PublicFolder | null> => {
  const folderData = {
    name,
    parent_id: parentId || null,
    created_by: createdBy || null
  };

  const { data, error } = await supabase
    .from('public_folders')
    .insert([folderData])
    .select()
    .single();

  if (error) {
    console.error('공용 폴더 생성 오류:', error);
    return null;
  }

  return data;
};

export const deletePublicFolder = async (folderId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('public_folders')
    .delete()
    .eq('id', folderId);

  if (error) {
    console.error('공용 폴더 삭제 오류:', error);
    return false;
  }

  return true;
};

export const movePublicFileToFolder = async (fileId: string, folderId?: string): Promise<boolean> => {
  const { error } = await supabase
    .from('public_files')
    .update({ folder_id: folderId || null, updated_at: new Date().toISOString() })
    .eq('id', fileId);

  if (error) {
    console.error('공용 파일 이동 오류:', error);
    return false;
  }

  return true;
};

// 공용 파일 관리
export const getPublicFiles = async (folderId?: string): Promise<PublicFile[]> => {
  let query = supabase
    .from('public_files')
    .select('*');

  if (folderId) {
    query = query.eq('folder_id', folderId);
  } else {
    query = query.is('folder_id', null);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('공용 파일 조회 오류:', error);
    return [];
  }

  return data || [];
};

export const uploadPublicFile = async (file: File, folderId?: string, uploadedBy?: string): Promise<PublicFile | null> => {
  const reader = new FileReader();

  return new Promise((resolve) => {
    reader.onload = async () => {
      const fileData = {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_url: reader.result as string,
        folder_id: folderId || null,
        uploaded_by: uploadedBy || null
      };

      const { data, error } = await supabase
        .from('public_files')
        .insert([fileData])
        .select()
        .single();

      if (error) {
        console.error('공용 파일 업로드 오류:', error);
        resolve(null);
      } else {
        resolve(data);
      }
    };

    reader.readAsDataURL(file);
  });
};

export const deletePublicFile = async (fileId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('public_files')
    .delete()
    .eq('id', fileId);

  if (error) {
    console.error('공용 파일 삭제 오류:', error);
    return false;
  }

  return true;
};

// 공용 파일/폴더 실시간 구독
export const subscribeToPublicFiles = (callback: (files: PublicFile[]) => void) => {
  const subscription = supabase
    .channel('public-files-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'public_files' },
      async () => {
        const files = await getPublicFiles();
        callback(files);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};

export const subscribeToPublicFolders = (callback: (folders: PublicFolder[]) => void) => {
  const subscription = supabase
    .channel('public-folders-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'public_folders' },
      async () => {
        const folders = await getPublicFolders();
        callback(folders);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};

// UUID 유효성 검사 헬퍼 함수
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// 간단한 파일 업로드 (공용 테이블 사용)
export const uploadSimpleFile = async (file: File, uploadedBy?: string): Promise<PublicFile | null> => {
  const reader = new FileReader();

  return new Promise((resolve) => {
    reader.onload = async () => {
      const fileData = {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_url: reader.result as string,
        uploaded_by: uploadedBy || '익명'
      };

      const { data, error } = await supabase
        .from('public_files')
        .insert([fileData])
        .select()
        .single();

      if (error) {
        console.error('파일 업로드 오류:', error);
        resolve(null);
      } else {
        resolve(data);
      }
    };

    reader.readAsDataURL(file);
  });
};

// 모든 파일 조회 (간단한 방식)
export const getAllSimpleFiles = async (): Promise<PublicFile[]> => {
  const { data, error } = await supabase
    .from('public_files')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('파일 조회 오류:', error);
    return [];
  }

  return data || [];
};

// 파일 삭제 (간단한 방식)
export const deleteSimpleFile = async (fileId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('public_files')
    .delete()
    .eq('id', fileId);

  if (error) {
    console.error('파일 삭제 오류:', error);
    return false;
  }

  return true;
};

// 실시간 파일 구독 (간단한 방식)
export const subscribeToSimpleFiles = (callback: (files: PublicFile[]) => void) => {
  const subscription = supabase
    .channel('simple-files-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'public_files' },
      async () => {
        const files = await getAllSimpleFiles();
        callback(files);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};
