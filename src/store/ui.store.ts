import { create } from 'zustand';

type ThemeMode = 'light' | 'dark' | 'system';

type NavLayout = 'vertical' | 'mini' | 'horizontal';

interface UiState {
  navLayout: NavLayout;
  isMobileNavOpen: boolean;
  theme: ThemeMode;
  setNavLayout: (layout: NavLayout) => void;
  toggleMobileNav: () => void;
  setTheme: (theme: ThemeMode) => void;
}

export const useUiStore = create<UiState>((set) => ({
  navLayout: 'vertical',
  isMobileNavOpen: false,
  theme: 'system',

  setNavLayout: (layout) => set({ navLayout: layout }),
  toggleMobileNav: () => set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
  setTheme: (theme) => set({ theme }),
}));
