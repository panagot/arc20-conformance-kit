export const STUDIO_IVORY_THEME = {
  id: "studio-ivory",
  name: "Studio Ivory",
  vars: {
    "--bg": "#faf9f7",
    "--panel": "#ffffff",
    "--panel-2": "#f5f3ef",
    "--input-bg": "#ffffff",
    "--border": "#e7e5e4",
    "--accent": "#1c1917",
    "--accent-2": "#57534e",
    "--accent-contrast": "#faf9f7",
    "--pass": "#059669",
    "--warn": "#b45309",
    "--fail": "#b91c1c",
    "--muted": "#78716c",
    "--text": "#1c1917",
    "--glow-1": "rgba(28, 25, 23, 0.03)",
    "--glow-2": "rgba(245, 243, 239, 0.9)",
    "--panel-gradient-from": "#ffffff",
    "--panel-gradient-to": "#faf9f7",
    "--panel-inset": "rgba(255, 255, 255, 1)",
    "--nav-shadow": "rgba(15, 23, 42, 0.06)",
    "--heatmap-label-bg": "rgba(15, 23, 42, 0.68)",
    "--ring-track": "rgba(15, 23, 42, 0.07)",
    "--ring-accent": "rgba(28, 25, 23, 0.15)",
    "--progress-from": "#44403c",
  },
} as const;

export function applyStudioIvoryTheme() {
  const root = document.documentElement;
  root.setAttribute("data-theme", STUDIO_IVORY_THEME.id);
  root.setAttribute("data-theme-mode", "light");
  Object.entries(STUDIO_IVORY_THEME.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
