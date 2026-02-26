// Tipos de Rol del usuario
export interface Role {
  id: string;
  name: string;
}

// Permiso/módulo de menú
export interface ModulePermission {
  id: string;
  name: string;
  icon?: string;
  path?: string;
  order?: number;
  itemparentId?: string;
  permissions: string[];
  moduleId?: string;
  children?: ModulePermission[];
}

// Agrupador de módulos
export interface UserModule {
  moduleId: string;
  subheader?: string;
  order?: number;
  items: ModulePermission[];
}

// El usuario autenticado
export interface User {
  id: string;
  names: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  accessToken?: string;
  role?: string;
  roles?: Role[];
  modules?: UserModule[];
}

// Interface global para las respuestas tipo paginadas o listados
export interface ApiResponse<T> {
  data: T;
  meta?: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
