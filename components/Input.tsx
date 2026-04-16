import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
    const id = useId();
    return (
        <div className={className}>
            <label htmlFor={id} className="block text-sm font-medium text-text-muted mb-1.5">{label}</label>
            <input
                id={id}
                {...props}
                className={`block w-full px-4 py-2.5 bg-background border border-surface-border rounded-lg text-sm
                           text-text placeholder-text-muted/50
                           focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                           disabled:bg-surface disabled:text-gray-500 transition-all duration-200
                           ${error ? 'border-error focus:border-error focus:ring-error' : ''}
                           `}
            />
            {error && <p className="mt-1 text-xs text-error">{error}</p>}
        </div>
    );
};