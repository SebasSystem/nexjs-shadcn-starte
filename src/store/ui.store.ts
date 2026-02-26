import { create } from 'zustand';

type ThemeMode = 'light' | 'dark' | 'system';

interface UiState {
  isSidebarOpen: boolean;
  theme: ThemeMode;
  toggleSidebar: () => void;
  setTheme: (theme: ThemeMode) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  theme: 'system',

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setTheme: (theme) => set({ theme }),
}));
