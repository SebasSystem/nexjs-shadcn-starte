'use client';

import { useState } from 'react';
import {
  useUiStore,
  type ColorPreset,
  type BgVariant,
  type NavColor,
  type FontSize,
  type ThemeMode,
  type NavLayout,
} from 'src/store/ui.store';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Button,
  Icon,
  ScrollArea,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'src/shared/components/ui';
import { cn } from 'src/lib/utils';
import { useTheme } from 'next-themes';

// ─────────────────────────────────────────────────────────────────────────────
// Maps de opciones
// ─────────────────────────────────────────────────────────────────────────────
const PRESETS: { value: ColorPreset; hex: string }[] = [
  { value: 'indigo', hex: '#6366f1' }, // preset-indigo
  { value: 'cyan', hex: '#06b6d4' }, // preset-cyan
  { value: 'teal', hex: '#14b8a6' }, // preset-teal
  { value: 'purple', hex: '#a855f7' }, // preset-purple
  { value: 'rose', hex: '#f43f5e' }, // preset-rose
  { value: 'orange', hex: '#f97316' }, // preset-orange
];

const THEMES: { value: ThemeMode; icon: React.ReactNode; label: string }[] = [
  { value: 'light', icon: <Icon name="Sun" size={18} />, label: 'Light' },
  { value: 'system', icon: <Icon name="Monitor" size={18} />, label: 'System' },
  { value: 'dark', icon: <Icon name="Moon" size={18} />, label: 'Dark' },
];

const BG_VARIANTS: { value: BgVariant; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'subtle', label: 'Subtle' },
  { value: 'canvas', label: 'Canvas' },
];

const NAV_COLORS: { value: NavColor; label: string }[] = [
  { value: 'default', label: 'Integre' },
  { value: 'dark', label: 'Oscuro' },
];

const NAV_LAYOUTS: { value: NavLayout; label: string; icon: string }[] = [
  { value: 'vertical', label: 'Vertical', icon: 'PanelLeft' },
  { value: 'horizontal', label: 'Horiz.', icon: 'PanelBottom' },
  { value: 'mini', label: 'Mini', icon: 'StretchHorizontal' },
];

const FONT_SIZES: { value: FontSize; label: string; iconSize: number }[] = [
  { value: 'sm', label: 'Small', iconSize: 14 },
  { value: 'md', label: 'Medium', iconSize: 18 },
  { value: 'lg', label: 'Large', iconSize: 22 },
];

const OptionLabel = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
    {children}
  </h4>
);

export function SettingsDrawer() {
  const [open, setOpen] = useState(false);

  // Store variables
  const {
    theme,
    navColor,
    colorPreset,
    bgVariant,
    fontSize,
    contrast,
    navLayout,
    setTheme,
    setNavColor,
    setColorPreset,
    setBgVariant,
    setFontSize,
    setContrast,
    setNavLayout,
  } = useUiStore();

  const { setTheme: setNextTheme } = useTheme();

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    setNextTheme(newTheme);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Botón flotante */}
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            'h-9 w-9 rounded-full text-muted-foreground',
            'hover:bg-accent hover:text-foreground transition-all duration-300'
          )}
        >
          <Icon name="Settings" size={20} className="animate-[spin_4s_linear_infinite]" />
        </Button>
      </SheetTrigger>

      {/* Contenido del panel */}
      <SheetContent className="w-[340px] p-0 border-l border-border/50 shadow-dialog sm:max-w-md">
        <SheetHeader className="p-6 border-b border-border/40 text-left">
          <SheetTitle className="text-lg font-semibold flex items-center gap-2">
            <Icon name="Settings" size={20} className="text-primary" />
            Configuración visual
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)] px-6 py-6 custom-scrollbar">
          <div className="flex flex-col gap-8 pb-10">
            {/* ── 1. Interfaz (Modo) ──────────────────────────── */}
            <div>
              <OptionLabel>Modo (Global)</OptionLabel>
              <div className="grid grid-cols-3 gap-2 p-1 bg-muted/50 rounded-xl border border-border/50">
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => handleThemeChange(t.value)}
                    className={cn(
                      'flex flex-col items-center justify-center gap-2 py-3 rounded-lg text-xs font-medium transition-all',
                      theme === t.value
                        ? 'bg-background shadow-card text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    )}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── 2. Color Preset ─────────────────────────────── */}
            <div>
              <OptionLabel>Color Principal</OptionLabel>
              <div className="flex flex-wrap gap-3">
                {PRESETS.map((p) => (
                  <TooltipProvider key={p.value} delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setColorPreset(p.value)}
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative',
                            colorPreset === p.value ? 'shadow-md scale-110' : ''
                          )}
                          style={{ backgroundColor: p.hex }}
                        >
                          {colorPreset === p.value && (
                            <Icon name="Check" size={16} className="text-white drop-shadow-md" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="capitalize" sideOffset={8}>
                        {p.value}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>

            <Separator className="bg-border/40" />

            {/* ── 3. Layout del Nav ───────────────────────────── */}
            <div>
              <OptionLabel>Layout de Navegación</OptionLabel>
              <div className="grid grid-cols-3 gap-3">
                {NAV_LAYOUTS.map((nl) => (
                  <button
                    key={nl.value}
                    onClick={() => setNavLayout(nl.value)}
                    className={cn(
                      'flex flex-col items-center justify-center gap-2 h-20 rounded-xl border transition-all',
                      navLayout === nl.value
                        ? 'border-primary bg-primary/5 text-primary shadow-card-hover'
                        : 'border-border/50 bg-background text-muted-foreground hover:border-primary/50 hover:bg-muted/30'
                    )}
                  >
                    <Icon name={nl.icon as import('src/shared/components/ui').IconName} size={24} />
                    <span className="text-[11px] font-semibold">{nl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── 4. Color del Sidebar ────────────────────────── */}
            <div>
              <OptionLabel>Apariencia del Sidebar</OptionLabel>
              <div className="grid grid-cols-2 gap-3">
                {NAV_COLORS.map((nc) => (
                  <button
                    key={nc.value}
                    onClick={() => setNavColor(nc.value)}
                    className={cn(
                      'flex items-center justify-center py-2.5 rounded-xl border text-sm font-medium transition-all',
                      navColor === nc.value
                        ? 'border-primary bg-primary/5 text-primary shadow-card-hover'
                        : 'border-border/50 bg-background text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    {nc.label}
                  </button>
                ))}
              </div>
            </div>

            <Separator className="bg-border/40" />

            {/* ── 5. Color de Fondo ───────────────────────────── */}
            <div>
              <OptionLabel>Fondo General</OptionLabel>
              <div className="grid grid-cols-3 gap-3">
                {BG_VARIANTS.map((bg) => (
                  <button
                    key={bg.value}
                    onClick={() => setBgVariant(bg.value)}
                    className={cn(
                      'flex items-center justify-center py-2.5 rounded-xl border text-sm font-medium transition-all',
                      bgVariant === bg.value
                        ? 'border-primary bg-primary/5 text-primary shadow-card-hover'
                        : 'border-border/50 bg-background text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── 6. Contraste ────────────────────────────────── */}
            <div>
              <OptionLabel>Contraste</OptionLabel>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setContrast('default')}
                  className={cn(
                    'flex items-center justify-center py-2.5 rounded-xl border text-sm font-medium transition-all',
                    contrast === 'default'
                      ? 'border-primary bg-primary/5 text-primary shadow-card-hover'
                      : 'border-border/50 bg-background text-muted-foreground hover:border-primary/50'
                  )}
                >
                  Suave (Default)
                </button>
                <button
                  onClick={() => setContrast('bold')}
                  className={cn(
                    'flex items-center justify-center py-2.5 rounded-xl border text-sm font-medium transition-all',
                    contrast === 'bold'
                      ? 'border-primary bg-primary/5 text-primary shadow-card-hover'
                      : 'border-border/50 bg-background text-muted-foreground hover:border-primary/50'
                  )}
                >
                  Intenso
                </button>
              </div>
            </div>

            {/* ── 7. Tipografía ───────────────────────────────── */}
            <div>
              <OptionLabel>Tamaño de Fuente</OptionLabel>
              <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50">
                {FONT_SIZES.map((fs) => (
                  <button
                    key={fs.value}
                    onClick={() => setFontSize(fs.value)}
                    className={cn(
                      'flex-1 flex items-center justify-center h-10 rounded-lg text-sm font-medium transition-all',
                      fontSize === fs.value
                        ? 'bg-background shadow-card text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    )}
                  >
                    <Icon name="ALargeSmall" size={fs.iconSize} />
                  </button>
                ))}
              </div>
            </div>
            {/* Espacio para que haga scroll cómodo al final */}
            <div className="h-6" />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
