type ColorScheme = 'light' | 'dark';

type ThemeColors = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  notification: string;
  text: string;
  radius: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
};

type Theme = {
  dark: boolean;
  colors: ThemeColors;
};

export const THEME = {
  light: {
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(0 0% 3.9%)',
    card: 'hsl(0 0% 100%)',
    cardForeground: 'hsl(0 0% 3.9%)',
    popover: 'hsl(0 0% 100%)',
    popoverForeground: 'hsl(0 0% 3.9%)',
    primary: 'hsl(0 0% 9%)',
    primaryForeground: 'hsl(0 0% 98%)',
    secondary: 'hsl(0 0% 96.1%)',
    secondaryForeground: 'hsl(0 0% 9%)',
    muted: 'hsl(0 0% 96.1%)',
    mutedForeground: 'hsl(0 0% 45.1%)',
    accent: 'hsl(0 0% 96.1%)',
    accentForeground: 'hsl(0 0% 9%)',
    destructive: 'hsl(0 84.2% 60.2%)',
    border: 'hsl(0 0% 89.8%)',
    input: 'hsl(0 0% 89.8%)',
    ring: 'hsl(0 0% 63%)',
    radius: '0.625rem',
    chart1: 'hsl(12 76% 61%)',
    chart2: 'hsl(173 58% 39%)',
    chart3: 'hsl(197 37% 24%)',
    chart4: 'hsl(43 74% 66%)',
    chart5: 'hsl(27 87% 67%)',
  },
  dark: {
    background: 'hsl(0 0% 3.9%)',
    foreground: 'hsl(0 0% 98%)',
    card: 'hsl(0 0% 3.9%)',
    cardForeground: 'hsl(0 0% 98%)',
    popover: 'hsl(0 0% 3.9%)',
    popoverForeground: 'hsl(0 0% 98%)',
    primary: 'hsl(0 0% 98%)',
    primaryForeground: 'hsl(0 0% 9%)',
    secondary: 'hsl(0 0% 14.9%)',
    secondaryForeground: 'hsl(0 0% 98%)',
    muted: 'hsl(0 0% 14.9%)',
    mutedForeground: 'hsl(0 0% 63.9%)',
    accent: 'hsl(0 0% 14.9%)',
    accentForeground: 'hsl(0 0% 98%)',
    destructive: 'hsl(0 70.9% 59.4%)',
    border: 'hsl(0 0% 14.9%)',
    input: 'hsl(0 0% 14.9%)',
    ring: 'hsl(300 0% 45%)',
    radius: '0.625rem',
    chart1: 'hsl(220 70% 50%)',
    chart2: 'hsl(160 60% 45%)',
    chart3: 'hsl(30 80% 55%)',
    chart4: 'hsl(280 65% 60%)',
    chart5: 'hsl(340 75% 55%)',
  },
};
  
export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    dark: false,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
      foreground: THEME.light.foreground,
      cardForeground: THEME.light.cardForeground,
      popover: THEME.light.popover,
      popoverForeground: THEME.light.popoverForeground,
      primaryForeground: THEME.light.primaryForeground,
      secondary: THEME.light.secondary,
      secondaryForeground: THEME.light.secondaryForeground,
      muted: THEME.light.muted,
      mutedForeground: THEME.light.mutedForeground,
      accent: THEME.light.accent,
      accentForeground: THEME.light.accentForeground,
      destructive: THEME.light.destructive,
      input: THEME.light.input,
      ring: THEME.light.ring,
      radius: THEME.light.radius,
      chart1: THEME.light.chart1,
      chart2: THEME.light.chart2,
      chart3: THEME.light.chart3,
      chart4: THEME.light.chart4,
      chart5: THEME.light.chart5,
    },
  },
  dark: {
    dark: true,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
      foreground: THEME.dark.foreground,
      cardForeground: THEME.dark.cardForeground,
      popover: THEME.dark.popover,
      popoverForeground: THEME.dark.popoverForeground,
      primaryForeground: THEME.dark.primaryForeground,
      secondary: THEME.dark.secondary,
      secondaryForeground: THEME.dark.secondaryForeground,
      muted: THEME.dark.muted,
      mutedForeground: THEME.dark.mutedForeground,
      accent: THEME.dark.accent,
      accentForeground: THEME.dark.accentForeground,
      destructive: THEME.dark.destructive,
      input: THEME.dark.input,
      ring: THEME.dark.ring,
      radius: THEME.dark.radius,
      chart1: THEME.dark.chart1,
      chart2: THEME.dark.chart2,
      chart3: THEME.dark.chart3,
      chart4: THEME.dark.chart4,
      chart5: THEME.dark.chart5,
    },
  },
};