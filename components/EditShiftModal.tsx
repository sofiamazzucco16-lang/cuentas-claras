import React, { useState } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { Shift } from '../types';
import { Save } from 'lucide-react';

interface EditShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (shift: Shift) => void;
    shift: Shift;
}

export const EditShiftModal: React.FC<EditShiftModalProps> = ({ isOpen, onClose, shift, onSave }) => {
    const [formData, setFormData] = useState({
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        breakHours: shift.breakHours.toString(),
        tips: shift.tips.toString(),
        gratuity: shift.gratuity.toString(),
        notes: shift.notes || ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const calculateTotalHours = () => {
        const [startHour, startMin] = formData.startTime.split(':').map(Number);
        const [endHour, endMin] = formData.endTime.split(':').map(Number);

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        let totalMinutes = endMinutes - startMinutes;
        if (totalMinutes < 0) totalMinutes += 24 * 60;

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

        const updatedShift: Shift = {
            ...shift,
            date: formData.date,
            startTime: formData.startTime,
            endTime: formData.endTime,
            breakHours: parseFloat(formData.breakHours || '0'),
            totalHours: calculateTotalHours(),
            tips: parseFloat(formData.tips || '0'),
            gratuity: parseFloat(formData.gratuity || '0'),
            notes: formData.notes
        };

        onSave(updatedShift);
        onClose();
    };

    React.useEffect(() => {
        if (isOpen) {
            setFormData({
                date: shift.date,
                startTime: shift.startTime,
                endTime: shift.endTime,
                breakHours: shift.breakHours.toString(),
                tips: shift.tips.toString(),
                gratuity: shift.gratuity.toString(),
                notes: shift.notes || ''
            });
            setErrors({});
        }
    }, [isOpen, shift]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Turno">
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

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Propinas ($)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.tips}
                        onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                    />
                    <Input
                        label="Gratuity ($)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.gratuity}
                        onChange={(e) => setFormData({ ...formData, gratuity: e.target.value })}
                    />
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
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                        Cancelar
                    </Button>
                    <Button type="submit" className="flex-1 gap-2">
                        <Save size={18} />
                        Guardar Cambios
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
