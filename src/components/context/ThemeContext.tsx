import { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const mode = localStorage.getItem('crm-theme-mode');
    if (mode === 'system') {
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
    }
    const saved = localStorage.getItem('crm-theme');
    return saved === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('crm-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('crm-theme', 'light');
    }
    localStorage.setItem('crm-theme-mode', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
