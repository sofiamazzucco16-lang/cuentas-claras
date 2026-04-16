import React, { useState, useEffect } from 'react';
import { Job } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';

interface JobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (job: Omit<Job, 'id'> & { id?: string }) => void;
    jobToEdit: Job | null;
}

const initialJobState: Omit<Job, 'id'> = {
    name: '',
    primaryRate: '',
    secondaryRate: '',
    federalTaxRate: '10',
};

export const JobModal: React.FC<JobModalProps> = ({ isOpen, onClose, onSave, jobToEdit }) => {
    const [job, setJob] = useState<Omit<Job, 'id'> & { id?: string }>(initialJobState);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            setErrors({});
            setJob(jobToEdit ? { ...initialJobState, ...jobToEdit } : initialJobState);
        }
    }, [jobToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setJob(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSave = () => {
        const newErrors: Record<string, string> = {};
        if (!job.name.trim()) newErrors.name = 'El nombre es requerido';
        if (!job.primaryRate || parseFloat(job.primaryRate) <= 0) newErrors.primaryRate = 'Ingresa una tarifa válida';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        onSave(job);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={jobToEdit ? 'Editar Trabajo' : 'Añadir Nuevo Trabajo'}
            className="max-w-lg"
        >
            <div className="space-y-5">
                <Input
                    label="Nombre del trabajo o restaurante"
                    name="name"
                    type="text"
                    value={job.name}
                    onChange={handleChange}
                    placeholder="ej: CRAFT Key Biscayne"
                    error={errors.name}
                />

                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs text-text-muted">
                    Encontrás estos datos en tu pay stub de Toast, arriba a la derecha donde dice <span className="font-semibold text-text">Pay Rate</span>.
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Input
                            label="Tarifa principal ($/hr)"
                            name="primaryRate"
                            type="number"
                            step="0.01"
                            min="0"
                            value={job.primaryRate}
                            onChange={handleChange}
                            placeholder="ej: 17.00"
                            error={errors.primaryRate}
                        />
                        <p className="text-xs text-text-muted mt-1 pl-1">La que dice "Pay Rate" en tu pay stub</p>
                    </div>
                    <div>
                        <Input
                            label="Segunda tarifa ($/hr) — opcional"
                            name="secondaryRate"
                            type="number"
                            step="0.01"
                            min="0"
                            value={job.secondaryRate}
                            onChange={handleChange}
                            placeholder="ej: 14.00"
                        />
                        <p className="text-xs text-text-muted mt-1 pl-1">Si también trabajás a otra tarifa</p>
                    </div>
                </div>

                <div className="border-t border-surface-border pt-5">
                    <h4 className="text-sm font-semibold text-text mb-3">Impuestos</h4>
                    <div>
                        <Input
                            label="Federal Income Tax (%)"
                            name="federalTaxRate"
                            type="number"
                            step="0.1"
                            min="0"
                            max="37"
                            value={job.federalTaxRate}
                            onChange={handleChange}
                            placeholder="ej: 10"
                        />
                        <p className="text-xs text-text-muted mt-1 pl-1">
                            Mirá tu último pay stub en la sección "Taxes" → "Federal Income Tax" — dividí ese monto por tu Gross y multiplicá por 100.
                        </p>
                    </div>
                    <div className="mt-3 p-3 bg-surface-hover rounded-lg">
                        <p className="text-xs text-text-muted">
                            <span className="font-semibold text-text">Medicare (1.45%)</span> y{' '}
                            <span className="font-semibold text-text">Social Security (6.2%)</span> son iguales
                            para todos — se calculan automáticamente.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3 border-t border-surface-border pt-4">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave}>Guardar</Button>
            </div>
        </Modal>
    );
};
