import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: "easeOut" }}
            className={`bg-surface border border-surface-border p-6 rounded-xl shadow-lg shadow-primary/5 hover:border-primary/30 transition-colors ${className}`}
        >
            {title && <h3 className="text-xl font-bold text-text mb-4">{title}</h3>}
            <div className="text-text-muted">
                {children}
            </div>
        </motion.div>
    );
};