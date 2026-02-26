import { User } from 'src/types';

export const MOCK_USER: User = {
  id: '1',
  names: 'Admin',
  email: 'admin@demo.com',
  displayName: 'Administrador',
  role: 'Administrador',
  roles: [{ id: '1', name: 'Administrador' }],
  modules: [],
};

// Podremos añadir más mock data aquí:
export const _mockUsersList = [
  MOCK_USER,
  {
    id: '2',
    names: 'Colaborador',
    email: 'colaborador@demo.com',
    displayName: 'Colaborador',
    role: 'Colaborador',
    roles: [{ id: '2', name: 'Colaborador' }],
    modules: [],
  },
];
