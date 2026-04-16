import React, { useId } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ label, children, className = '', ...props }) => {
    const id = useId();
    return (
        <div className={className}>
            <label htmlFor={id} className="block text-sm font-medium text-text-muted mb-1.5">{label}</label>
            <div className="relative">
                <select
                    id={id}
                    {...props}
                    className="block w-full px-4 py-2.5 bg-background border border-surface-border rounded-lg text-sm
                               text-text appearance-none
                               focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                               disabled:bg-surface disabled:text-gray-500 transition-all duration-200"
                >
                    {children}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
};