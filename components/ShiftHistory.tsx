import React from 'react';
import { Shift } from '../types';
import { Card } from './ResultCard';
import { Edit2, Trash2 } from 'lucide-react';

interface ShiftHistoryProps {
    shifts: Shift[];
    primaryRate?: number;
    onEditShift?: (shift: Shift) => void;
    onDeleteShift?: (shiftId: string) => void;
}

const formatDate = (dateStr: string): string => {
    try {
        return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            timeZone: 'UTC',
        });
    } catch {
        return dateStr;
    }
};

export const ShiftHistory: React.FC<ShiftHistoryProps> = ({ shifts, primaryRate, onEditShift, onDeleteShift }) => {
    const handleDelete = (shift: Shift) => {
        if (window.confirm(`¿Eliminar el turno del ${formatDate(shift.date)}?`)) {
            onDeleteShift?.(shift.id);
        }
    };

    return (
        <Card title="Historial de Turnos">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-text">
                    <thead>
                        <tr className="border-b border-surface-border">
                            <th className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Fecha</th>
                            <th className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Horario</th>
                            <th className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider text-center">Desc.</th>
                            <th className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Tips</th>
                            <th className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Gratuity</th>
                            <th className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider text-center">Tarifa</th>
                            <th className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider text-center">Horas</th>
                            {(onEditShift || onDeleteShift) && (
                                <th className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider text-center">Acciones</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border/50">
                        {shifts.map((shift) => (
                            <tr key={shift.id} className="hover:bg-surface-hover/40 transition-colors">
                                <td className="px-3 py-3 font-medium text-text whitespace-nowrap">
                                    {formatDate(shift.date)}
                                </td>
                                <td className="px-3 py-3 text-text-muted whitespace-nowrap">
                                    {shift.startTime && shift.endTime
                                        ? `${shift.startTime} – ${shift.endTime}`
                                        : '—'}
                                </td>
                                <td className="px-3 py-3 text-center text-text-muted">
                                    {shift.breakHours > 0 ? `${shift.breakHours.toFixed(1)}h` : '—'}
                                </td>
                                <td className="px-3 py-3 text-right font-semibold text-secondary">
                                    {(shift.tips || 0) > 0 ? `$${(shift.tips || 0).toFixed(2)}` : '—'}
                                </td>
                                <td className="px-3 py-3 text-right font-semibold text-primary">
                                    {(shift.gratuity || 0) > 0 ? `$${(shift.gratuity || 0).toFixed(2)}` : '—'}
                                </td>
                                <td className="px-3 py-3 text-center text-text-muted text-xs">
                                    ${(shift.hourlyRate || primaryRate || 0).toFixed(2)}/h
                                </td>
                                <td className="px-3 py-3 text-center">
                                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                                        {shift.totalHours.toFixed(2)}h
                                    </span>
                                </td>
                                {(onEditShift || onDeleteShift) && (
                                    <td className="px-3 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            {onEditShift && (
                                                <button
                                                    onClick={() => onEditShift(shift)}
                                                    className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                                    aria-label="Editar turno"
                                                    title="Editar turno"
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                            )}
                                            {onDeleteShift && (
                                                <button
                                                    onClick={() => handleDelete(shift)}
                                                    className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded transition-colors"
                                                    aria-label="Eliminar turno"
                                                    title="Eliminar turno"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
