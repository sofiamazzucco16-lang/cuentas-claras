import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
    isDark: boolean;
    onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className="p-2 rounded-lg bg-surface hover:bg-surface-hover border border-surface-border 
                       transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
            {isDark ? (
                <Sun size={20} className="text-secondary" />
            ) : (
                <Moon size={20} className="text-primary" />
            )}
        </button>
    );
};
