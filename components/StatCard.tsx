import React from 'react';
import { Wallet, Banknote, Clock, Receipt } from 'lucide-react';

export const Icons = {
    Wallet: <Wallet size={24} />,
    Cash: <Banknote size={24} />,
    Clock: <Clock size={24} />,
    Tax: <Receipt size={24} />,
};

interface StatCardProps {
    label: string;
    value: string;
    description: string;
    icon: React.ReactNode;
    isPrimary?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, description, icon, isPrimary }) => (
    <div className={`bg-background/50 p-4 rounded-lg flex items-start space-x-4 transition-all hover:bg-background/80 ${isPrimary ? 'ring-2 ring-primary/50 bg-primary/5' : 'border border-surface-border'}`}>
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${isPrimary ? 'bg-primary/20 text-primary' : 'bg-surface-border/50 text-text-muted'}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-text-muted font-medium">{label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${isPrimary ? 'text-primary' : 'text-text'}`}>{value}</p>
            <p className="text-xs text-text-muted/80 mt-1">{description}</p>
        </div>
    </div>
);