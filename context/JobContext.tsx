import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { Job } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface JobContextType {
    jobs: Job[];
    selectedJobId: string | null;
    selectedJob: Job | null;
    addJob: (job: Omit<Job, 'id'>) => void;
    updateJob: (job: Job) => void;
    deleteJob: (id: string) => void;
    selectJob: (id: string) => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

const defaultJob: Job = {
    id: 'default-1',
    name: 'CRAFT Key Biscayne',
    primaryRate: '17.00',
    secondaryRate: '14.00',
    federalTaxRate: '10',
};

// Migración: convierte jobs viejos (con hourlyRate, etc.) al nuevo formato
const migrateJob = (job: Record<string, unknown>): Job => {
    if (job.primaryRate !== undefined) return job as unknown as Job;
    return {
        id: job.id,
        name: job.name,
        primaryRate: job.hourlyRate || '17.00',
        secondaryRate: '',
        federalTaxRate: job.taxRate || '10',
    };
};

export const JobProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [rawJobs, setJobs] = useLocalStorage<Record<string, unknown>[]>('cc_jobs', [defaultJob as unknown as Record<string, unknown>]);
    const [selectedJobId, setSelectedJobId] = useLocalStorage<string | null>('cc_selected_job_id', 'default-1');

    const jobs: Job[] = useMemo(() => rawJobs.map(migrateJob), [rawJobs]);

    const selectedJob = useMemo(() => {
        return jobs.find(job => job.id === selectedJobId) || null;
    }, [jobs, selectedJobId]);

    const addJob = (jobData: Omit<Job, 'id'>) => {
        const newJob: Job = { ...jobData, id: `job-${Date.now()}` };
        setJobs((prev) => [...prev, newJob]);
        setSelectedJobId(newJob.id);
    };

    const updateJob = (updatedJob: Job) => {
        setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
    };

    const deleteJob = (id: string) => {
        const remainingJobs = jobs.filter((j) => j.id !== id);
        setJobs(remainingJobs);
        if (selectedJobId === id) {
            setSelectedJobId(remainingJobs.length > 0 ? remainingJobs[0].id : null);
        }
    };

    const selectJob = (id: string) => {
        setSelectedJobId(id);
    };

    return (
        <JobContext.Provider value={{ jobs, selectedJobId, selectedJob, addJob, updateJob, deleteJob, selectJob }}>
            {children}
        </JobContext.Provider>
    );
};

export const useJob = () => {
    const context = useContext(JobContext);
    if (context === undefined) {
        throw new Error('useJob must be used within a JobProvider');
    }
    return context;
};
