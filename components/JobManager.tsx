import React from 'react';
import { Card } from './ResultCard';
import { Button } from './Button';
import { Select } from './Select';
import { Job } from '../types';
import { Edit2, Trash2, Plus, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface JobManagerProps {
    jobs: Job[];
    selectedJobId: string | null;
    onSelectJob: (id: string) => void;
    onAddJob: () => void;
    onEditJob: (job: Job) => void;
    onDeleteJob: (id: string) => void;
    disabled?: boolean;
}

export const JobManager: React.FC<JobManagerProps> = ({ jobs, selectedJobId, onSelectJob, onAddJob, onEditJob, onDeleteJob, disabled }) => {
    const handleDelete = (job: Job) => {
        if (window.confirm(`¿Eliminar el trabajo "${job.name}"? Se borrarán todos sus turnos analizados.`)) {
            onDeleteJob(job.id);
        }
    };

    return (
        <Card title="Configurar Trabajo">
            <div className="space-y-5">
                {jobs.length > 0 && (
                    <Select
                        label="Trabajo activo para análisis"
                        value={selectedJobId || ''}
                        onChange={(e) => onSelectJob(e.target.value)}
                        disabled={disabled || jobs.length === 0}
                    >
                        {jobs.map(job => (
                            <option key={job.id} value={job.id}>{job.name}</option>
                        ))}
                    </Select>
                )}

                <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Mis Trabajos</h4>
                    {jobs.length > 0 ? (
                        <ul className="space-y-2">
                            <AnimatePresence>
                                {jobs.map(job => (
                                    <motion.li
                                        key={job.id}
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -16 }}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                                            job.id === selectedJobId
                                                ? 'bg-primary/10 border-primary/30'
                                                : 'bg-surface-hover/50 border-transparent hover:border-surface-border'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`p-1.5 rounded-lg flex-shrink-0 ${job.id === selectedJobId ? 'bg-primary/20 text-primary' : 'bg-surface text-text-muted'}`}>
                                                <Briefcase size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`font-semibold truncate ${job.id === selectedJobId ? 'text-primary' : 'text-text'}`}>
                                                    {job.name}
                                                </p>
                                                <p className="text-xs text-text-muted">
                                                    ${job.primaryRate}/hr{job.secondaryRate ? ` · $${job.secondaryRate}/hr` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
                                            <button
                                                onClick={() => onEditJob(job)}
                                                disabled={disabled}
                                                className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                aria-label={`Editar ${job.name}`}
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(job)}
                                                disabled={disabled}
                                                className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                                                aria-label={`Eliminar ${job.name}`}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </motion.li>
                                ))}
                            </AnimatePresence>
                        </ul>
                    ) : (
                        <div className="text-center py-8 border border-dashed border-surface-border rounded-xl bg-surface/30">
                            <Briefcase size={28} className="mx-auto text-surface-border mb-2" />
                            <p className="text-text-muted text-sm">No hay trabajos configurados.</p>
                            <p className="text-text-muted text-xs mt-1">Agrega uno para comenzar.</p>
                        </div>
                    )}
                </div>

                <Button variant="secondary" onClick={onAddJob} className="w-full" disabled={disabled}>
                    <Plus size={17} className="mr-2" /> Añadir Trabajo
                </Button>
            </div>
        </Card>
    );
};
