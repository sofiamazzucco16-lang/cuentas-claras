import React, { useState, useEffect } from 'react';
import { Shift } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';

type EditableShift = Omit<Shift, 'breakHours' | 'totalHours' | 'tips' | 'gratuity'> & {
    breakHours: string | number;
    totalHours: string | number;
    tips?: string | number;
    gratuity?: string | number;
};

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (shifts: Shift[]) => void;
    initialShifts: Shift[];
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onConfirm, initialShifts }) => {
    const [editableShifts, setEditableShifts] = useState<EditableShift[]>([]);

    useEffect(() => {
        if (isOpen) {
            setEditableShifts(initialShifts.map(s => ({ ...s })));
        }
    }, [initialShifts, isOpen]);

    const handleShiftChange = (index: number, field: keyof EditableShift, value: string) => {
        const newShifts = [...editableShifts];
        const shiftToUpdate = { ...newShifts[index] };
        (shiftToUpdate as any)[field] = value;

        if (['startTime', 'endTime', 'breakHours'].includes(field)) {
            const { startTime, endTime, breakHours } = shiftToUpdate;
            if (startTime && endTime && typeof startTime === 'string' && typeof endTime === 'string') {
                try {
                    const start = new Date(`1970-01-01T${startTime}:00Z`);
                    const end = new Date(`1970-01-01T${endTime}:00Z`);
                    let diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    if (diffHours < 0) diffHours += 24;
                    const breakValue = parseFloat(String(breakHours).trim()) || 0;
                    shiftToUpdate.totalHours = Math.max(0, diffHours - breakValue).toFixed(2);
                } catch (e) {
                    console.error("Invalid time format", e);
                }
            }
        }

        newShifts[index] = shiftToUpdate;
        setEditableShifts(newShifts);
    };

    const handleRemoveShift = (index: number) => {
        setEditableShifts(prev => prev.filter((_, i) => i !== index));
    };

    const handleConfirm = () => {
        const confirmedShifts: Shift[] = editableShifts.map(shift => ({
            ...shift,
            breakHours: parseFloat(String(shift.breakHours).trim()) || 0,
            totalHours: parseFloat(String(shift.totalHours).trim()) || 0,
            tips: parseFloat(String(shift.tips ?? '0').trim()) || 0,
            gratuity: parseFloat(String(shift.gratuity ?? '0').trim()) || 0,
            notes: shift.notes,
        }));
        onConfirm(confirmedShifts);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Revisar Turnos Extraídos"
            className="max-w-3xl"
        >
            <p className="text-text-muted mb-6 text-sm">
                Verifica la información extraída y corrige lo que sea necesario antes de confirmar.
            </p>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {editableShifts.map((shift, index) => (
                    <div
                        key={shift.id}
                        className="bg-background/60 border border-surface-border rounded-xl p-4"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                Turno {index + 1}
                            </span>
                            <button
                                onClick={() => handleRemoveShift(index)}
                                className="text-xs text-error/70 hover:text-error transition-colors"
                            >
                                Eliminar
                            </button>
                        </div>

                        {/* Row 1: Fecha, Inicio, Fin, Descanso */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                            <Input
                                label="Fecha"
                                type="date"
                                value={shift.date}
                                onChange={e => handleShiftChange(index, 'date', e.target.value)}
                            />
                            <Input
                                label="Inicio"
                                type="time"
                                value={shift.startTime}
                                onChange={e => handleShiftChange(index, 'startTime', e.target.value)}
                            />
                            <Input
                                label="Fin"
                                type="time"
                                value={shift.endTime}
                                onChange={e => handleShiftChange(index, 'endTime', e.target.value)}
                            />
                            <Input
                                label="Descanso (h)"
                                type="number"
                                step="0.25"
                                min="0"
                                value={shift.breakHours}
                                onChange={e => handleShiftChange(index, 'breakHours', e.target.value)}
                            />
                        </div>

                        {/* Row 2: Total, Propinas, Gratuity */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="relative">
                                <Input
                                    label="Total (h)"
                                    type="number"
                                    step="0.01"
                                    value={shift.totalHours}
                                    onChange={e => handleShiftChange(index, 'totalHours', e.target.value)}
                                />
                                <span className="absolute bottom-2 right-2 text-xs text-text-muted pointer-events-none">auto</span>
                            </div>
                            <Input
                                label="Propinas ($)"
                                type="number"
                                step="0.01"
                                min="0"
                                value={shift.tips ?? ''}
                                onChange={e => handleShiftChange(index, 'tips', e.target.value)}
                            />
                            <Input
                                label="Gratuity ($)"
                                type="number"
                                step="0.01"
                                min="0"
                                value={shift.gratuity ?? ''}
                                onChange={e => handleShiftChange(index, 'gratuity', e.target.value)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end mt-6 space-x-3 border-t border-surface-border pt-4">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button onClick={handleConfirm} disabled={editableShifts.length === 0}>
                    Confirmar {editableShifts.length > 0 ? `(${editableShifts.length} turno${editableShifts.length !== 1 ? 's' : ''})` : ''}
                </Button>
            </div>
        </Modal>
    );
};
