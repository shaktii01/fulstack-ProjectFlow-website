import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from './ThemeProvider';

const ThemeToggle = ({ className, showLabel = false, size, ...props }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';

  return (
    <Button
      type="button"
      variant="outline"
      size={size || (showLabel ? 'sm' : 'icon')}
      className={cn('shrink-0', className)}
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      {...props}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {showLabel && (
        <span className="ml-2">
          {isDark ? 'Light Theme' : 'Dark Theme'}
        </span>
      )}
    </Button>
  );
};

export default ThemeToggle;
