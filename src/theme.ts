export const theme = {
  colors: {
    canvas: '#F7F2E9',
    surface: '#FFFDF8',
    ink: '#064D3B',
    inkSoft: '#4B665D',
    lime: '#C8E56B',
    limeSoft: '#E4F3A6',
    coral: '#EC7448',
    coralSoft: '#F7B08F',
    pink: '#ECA4D0',
    white: '#FFFFFF',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  radii: {
    control: '9999rem',
    card: '1.5rem',
  },
  typography: {
    display: 'font-poppins-black tracking-tight',
    body: 'font-poppins leading-6',
    label: 'font-poppins-semibold text-xs uppercase tracking-wide',
  },
} as const;
