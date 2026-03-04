import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────
export type ThemeMode = 'light' | 'dark' | 'system';
export type NavLayout = 'vertical' | 'mini' | 'horizontal';
export type ColorPreset = 'indigo' | 'cyan' | 'teal' | 'purple' | 'rose' | 'orange';
export type BgVariant = 'default' | 'subtle' | 'canvas';
export type FontSize = number; // px exactos, rango 12-20, default 16
export type NavColor = 'default' | 'dark';
export type Contrast = 'default' | 'bold';
export type FontFamily = 'public-sans' | 'inter' | 'dm-sans' | 'nunito-sans';

// ─────────────────────────────────────────────────────────────────────────────
// Estado + acciones
// ─────────────────────────────────────────────────────────────────────────────
interface UiState {
  // ── Layout ────────────────────────────────────────────────────────────────
  navLayout: NavLayout;
  isMobileNavOpen: boolean;

  // ── Apariencia ────────────────────────────────────────────────────────────
  theme: ThemeMode; // dark/light global (next-themes)
  navColor: NavColor; // sidebar: 'default' | 'dark' (independiente del theme global)
  colorPreset: ColorPreset;
  bgVariant: BgVariant;
  fontSize: FontSize;
  contrast: Contrast;
  fontFamily: FontFamily;

  // ── Acciones ──────────────────────────────────────────────────────────────
  setNavLayout: (layout: NavLayout) => void;
  toggleMobileNav: () => void;
  setTheme: (theme: ThemeMode) => void;
  setNavColor: (color: NavColor) => void;
  setColorPreset: (preset: ColorPreset) => void;
  setBgVariant: (bg: BgVariant) => void;
  setFontSize: (size: FontSize) => void;
  setContrast: (contrast: Contrast) => void;
  setFontFamily: (font: FontFamily) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Store — persiste en localStorage para que las preferencias sobrevivan reloads
// ─────────────────────────────────────────────────────────────────────────────
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      // defaults
      navLayout: 'vertical',
      isMobileNavOpen: false,
      theme: 'system',
      navColor: 'default',
      colorPreset: 'indigo',
      bgVariant: 'default',
      fontSize: 16,
      contrast: 'default',
      fontFamily: 'public-sans',

      // acciones
      setNavLayout: (navLayout) => set({ navLayout }),
      toggleMobileNav: () => set((s) => ({ isMobileNavOpen: !s.isMobileNavOpen })),
      setTheme: (theme) => set({ theme }),
      setNavColor: (navColor) => set({ navColor }),
      setColorPreset: (colorPreset) => set({ colorPreset }),
      setBgVariant: (bgVariant) => set({ bgVariant }),
      setFontSize: (fontSize) => set({ fontSize }),
      setContrast: (contrast) => set({ contrast }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
    }),
    {
      name: 'crm-ui-settings', // clave en localStorage
      // Solo persistir las preferencias visuales, no el estado de UI transitorio
      partialize: (state) => ({
        navLayout: state.navLayout,
        theme: state.theme,
        navColor: state.navColor,
        colorPreset: state.colorPreset,
        bgVariant: state.bgVariant,
        fontSize: state.fontSize,
        contrast: state.contrast,
        fontFamily: state.fontFamily,
      }),
    }
  )
);
