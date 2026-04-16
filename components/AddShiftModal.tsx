import React, { useState } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { Shift } from '../types';
import { Plus } from 'lucide-react';

interface AddShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (shift: Omit<Shift, 'id'>) => void;
}

export const AddShiftModal: React.FC<AddShiftModalProps> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        breakHours: '0.5',
        hourlyRate: '',
        tips: '0',
        gratuity: '0',
        notes: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const calculateTotalHours = () => {
        const [startHour, startMin] = formData.startTime.split(':').map(Number);
        const [endHour, endMin] = formData.endTime.split(':').map(Number);

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        let totalMinutes = endMinutes - startMinutes;
        if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle overnight shifts

        const totalHours = totalMinutes / 60 - parseFloat(formData.breakHours || '0');
        return Math.max(0, totalHours);
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.date) newErrors.date = 'La fecha es requerida';
        if (!formData.startTime) newErrors.startTime = 'La hora de inicio es requerida';
        if (!formData.endTime) newErrors.endTime = 'La hora de fin es requerida';

        const breakHours = parseFloat(formData.breakHours);
        if (isNaN(breakHours) || breakHours < 0) {
            newErrors.breakHours = 'Las horas de descanso deben ser un número válido';
        }

        const totalHours = calculateTotalHours();
        if (totalHours <= 0) {
            newErrors.endTime = 'La hora de fin debe ser después de la hora de inicio';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const shift: Omit<Shift, 'id'> = {
            date: formData.date,
            startTime: formData.startTime,
            endTime: formData.endTime,
            breakHours: parseFloat(formData.breakHours || '0'),
            totalHours: calculateTotalHours(),
            hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
            tips: parseFloat(formData.tips || '0'),
            gratuity: parseFloat(formData.gratuity || '0'),
            notes: formData.notes
        };

        onSave(shift);
        handleClose();
    };

    const handleClose = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            startTime: '09:00',
            endTime: '17:00',
            breakHours: '0.5',
            hourlyRate: '',
            tips: '0',
            gratuity: '0',
            notes: ''
        });
        setErrors({});
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Agregar Turno Manualmente">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Fecha"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    error={errors.date}
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Hora de Inicio"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        error={errors.startTime}
                        required
                    />
                    <Input
                        label="Hora de Fin"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        error={errors.endTime}
                        required
                    />
                </div>

                <Input
                    label="Horas de Descanso"
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.breakHours}
                    onChange={(e) => setFormData({ ...formData, breakHours: e.target.value })}
                    error={errors.breakHours}
                    required
                />

                <div className="p-3 bg-surface-hover rounded-lg border border-surface-border">
                    <p className="text-sm text-text-muted">
                        <span className="font-semibold text-text">Horas Totales: </span>
                        {calculateTotalHours().toFixed(2)} horas
                    </p>
                </div>

                <Input
                    label="Tarifa por hora ($) — opcional"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    placeholder="ej: 14.00 (dejar vacío para usar la tarifa del trabajo)"
                />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Input
                            label="Tips — propinas tarjeta ($)"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.tips}
                            onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                        />
                    </div>
                    <div>
                        <Input
                            label="Gratuity — service charge ($)"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.gratuity}
                            onChange={(e) => setFormData({ ...formData, gratuity: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1.5">
                        Notas (Opcional)
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="block w-full px-4 py-2.5 bg-background border border-surface-border rounded-lg text-sm
                                   text-text placeholder-text-muted/50
                                   focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                                   transition-all duration-200"
                        rows={3}
                        placeholder="Ej: Turno de cierre, día festivo, etc."
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
                        Cancelar
                    </Button>
                    <Button type="submit" className="flex-1 gap-2">
                        <Plus size={18} />
                        Agregar Turno
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
