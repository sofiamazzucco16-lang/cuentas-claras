import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'text' | 'danger';
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseClasses = "px-6 py-2.5 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2";

    const variantClasses = {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover focus:ring-primary-focus shadow-lg shadow-primary/20",
        secondary: "bg-surface text-text hover:bg-surface-hover border border-surface-border focus:ring-gray-500",
        text: "text-secondary hover:text-secondary-hover hover:underline",
        danger: "bg-error/10 text-error hover:bg-error/20 border border-error/20"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            {...props}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        >
            {children}
        </motion.button>
    );
};