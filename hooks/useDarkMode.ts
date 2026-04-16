import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const useDarkMode = () => {
    const [isDark, setIsDark] = useLocalStorage<boolean>('darkMode', false);

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            document.body.classList.add('dark');
        } else {
            root.classList.remove('dark');
            document.body.classList.remove('dark');
        }
    }, [isDark]);

    const toggleDarkMode = () => {
        setIsDark(!isDark);
    };

    return { isDark, toggleDarkMode };
};
