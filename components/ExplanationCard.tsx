import React from 'react';
import { Card } from './ResultCard';
import { Sparkles } from 'lucide-react';

interface ExplanationCardProps {
    summary: string;
}

export const ExplanationCard: React.FC<ExplanationCardProps> = ({ summary }) => {
    const lines = summary.split('\n').filter(line => line.trim().length > 0);

    return (
        <Card title="Resumen del Análisis">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5 p-2 bg-primary/10 rounded-lg text-primary">
                    <Sparkles size={16} />
                </div>
                <ul className="space-y-2 flex-1">
                    {lines.map((line, i) => (
                        <li key={i} className="text-sm text-text-muted leading-relaxed">
                            {line.startsWith('-') ? (
                                <span className="flex gap-2">
                                    <span className="text-primary font-bold mt-0.5 flex-shrink-0">·</span>
                                    <span>{line.slice(1).trim()}</span>
                                </span>
                            ) : (
                                <span className={i === 0 ? 'font-medium text-text' : ''}>{line}</span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </Card>
    );
};
