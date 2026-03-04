'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useUiStore } from 'src/store/ui.store';

// ─────────────────────────────────────────────────────────────────────────────
// useSettings
//
// Responsabilidad única: sincronizar el estado del store con clases CSS en
// <html> y con next-themes para dark/light. Se llama UNA SOLA VEZ en el
// root layout protegido.
//
// Las clases CSS están definidas en globals.css (Settings System).
// No se usan setProperty inline para mantener todo en CSS.
// ─────────────────────────────────────────────────────────────────────────────

const COLOR_PRESETS = ['indigo', 'cyan', 'teal', 'purple', 'rose', 'orange'] as const;
const BG_VARIANTS = ['default', 'subtle', 'canvas'] as const;
const FONT_FAMILIES = ['public-sans', 'inter', 'dm-sans', 'nunito-sans'] as const;

export function useSettings() {
  const { colorPreset, bgVariant, fontSize, contrast, theme, fontFamily } = useUiStore();
  const { setTheme } = useTheme();

  // ── Sincronizar theme con next-themes ──────────────────────────────────────
  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  // ── Aplicar color preset ───────────────────────────────────────────────────
  useEffect(() => {
    const html = document.documentElement;
    // Quitar todos los presets
    COLOR_PRESETS.forEach((p) => html.classList.remove(`preset-${p}`));
    // Aplicar el seleccionado (indigo es el default de :root, no necesita clase)
    if (colorPreset !== 'indigo') {
      html.classList.add(`preset-${colorPreset}`);
    }
  }, [colorPreset]);

  // ── Aplicar background variant ─────────────────────────────────────────────
  useEffect(() => {
    const html = document.documentElement;
    BG_VARIANTS.forEach((b) => html.classList.remove(`bg-${b}`));
    if (bgVariant !== 'default') {
      html.classList.add(`bg-${bgVariant}`);
    }
  }, [bgVariant]);

  // ── Aplicar font size (px exactos, escalado via font-size en html) ──────────
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  // ── Aplicar contrast ───────────────────────────────────────────────────────
  useEffect(() => {
    const html = document.documentElement;
    if (contrast === 'bold') {
      html.classList.add('contrast-bold');
    } else {
      html.classList.remove('contrast-bold');
    }
  }, [contrast]);

  // ── Aplicar font family ─────────────────────────────────────────
  useEffect(() => {
    const html = document.documentElement;
    // Quitar todas las clases de fuente previas
    FONT_FAMILIES.forEach((f) => html.classList.remove(`font-${f}`));
    // Aplicar la seleccionada (public-sans es el default de :root, no necesita clase)
    if (fontFamily !== 'public-sans') {
      html.classList.add(`font-${fontFamily}`);
    }
  }, [fontFamily]);
}
