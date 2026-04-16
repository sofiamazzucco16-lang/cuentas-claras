import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { Button } from './components/Button';
import { ShiftHistory } from './components/ShiftHistory';
import { ReviewModal } from './components/ReviewModal';
import { ExplanationCard } from './components/ExplanationCard';
import { SummaryCard } from './components/SummaryCard';
import { Card } from './components/ResultCard';
import { JobManager } from './components/JobManager';
import { JobModal } from './components/JobModal';
import { HoursChart } from './components/HoursChart';
import { CombinedEarningsChart } from './components/CombinedEarningsChart';
import { GlobalSummaryCard } from './components/GlobalSummaryCard';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ExportMenu } from './components/ExportMenu';
import { AddShiftModal } from './components/AddShiftModal';
import { EditShiftModal } from './components/EditShiftModal';
import { ThemeToggle } from './components/ThemeToggle';
import { useJob } from './context/JobContext';
import { useShiftAnalysis } from './hooks/useShiftAnalysis';
import { PayDetails, Job, Shift } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { exportToPDF, exportToCSV } from './utils/exportPDF';
import { filesToStoredImages, storedImagesToFiles, StoredImage } from './utils/imageStorage';
import { useDarkMode } from './hooks/useDarkMode';
import { Spinner } from './components/Spinner';

function App() {
    const {
        jobs,
        selectedJobId,
        selectedJob,
        selectJob,
        addJob,
        updateJob,
        deleteJob
    } = useJob();

    const {
        parsedDataByJob,
        loading,
        error,
        isReviewModalOpen,
        dataForReview,
        setReviewModalOpen,
        analyzeImages,
        confirmReview,
        deleteAnalysis,
        addManualShift,
        editShift,
        deleteShift
    } = useShiftAnalysis();

    const [jobImageFiles, setJobImageFiles] = useState<Record<string, File[]>>({});
    const [storedImages, setStoredImages] = useLocalStorage<Record<string, StoredImage[]>>('cc_job_images', {});
    const [isJobModalOpen, setJobModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [isAddShiftModalOpen, setAddShiftModalOpen] = useState(false);
    const [isEditShiftModalOpen, setEditShiftModalOpen] = useState(false);
    const [shiftToEdit, setShiftToEdit] = useState<Shift | null>(null);
    const [hasStarted, setHasStarted] = useLocalStorage<boolean>('hasStarted', false);
    const { isDark, toggleDarkMode } = useDarkMode();
    const chartsRef = useRef<HTMLDivElement>(null);

    // Load stored images on mount and when selected job changes
    useEffect(() => {
        if (selectedJobId && storedImages[selectedJobId]) {
            const files = storedImagesToFiles(storedImages[selectedJobId]);
            setJobImageFiles(prev => ({
                ...prev,
                [selectedJobId]: files
            }));
        }
    }, [selectedJobId, storedImages]);

    const selectedJobFiles = useMemo(() => {
        if (!selectedJobId) return [];
        return jobImageFiles[selectedJobId] || [];
    }, [jobImageFiles, selectedJobId]);

    const currentData = useMemo(() => {
        if (!selectedJobId) return null;
        return parsedDataByJob[selectedJobId] || null;
    }, [parsedDataByJob, selectedJobId]);

    const globalSummary = useMemo(() => {
        const analyzedJobsData = Object.values(parsedDataByJob);
        if (analyzedJobsData.length < 2) return null;

        const initialPayDetails: PayDetails = {
            totalHours: 0, regularPay: 0, tips: 0, gratuity: 0,
            grossPay: 0, federalTax: 0, medicareTax: 0, socialSecurityTax: 0,
            totalTaxes: 0, netPay: 0
        };

        const totalPayDetails = analyzedJobsData.reduce((acc: PayDetails, data) => {
            (Object.keys(acc) as Array<keyof PayDetails>).forEach(key => {
                acc[key] += data.payDetails[key];
            });
            return acc;
        }, initialPayDetails);

        return {
            totalPayDetails,
            totalJobsAnalyzed: analyzedJobsData.length
        };
    }, [parsedDataByJob]);

    const handleImageUpload = async (files: File[]) => {
        if (selectedJobId) {
            setJobImageFiles(prev => ({
                ...prev,
                [selectedJobId]: files,
            }));

            // Persist images to localStorage
            try {
                const stored = await filesToStoredImages(files);
                setStoredImages(prev => ({
                    ...prev,
                    [selectedJobId]: stored
                }));
            } catch (error) {
                console.error('Error storing images:', error);
            }
        }
    };

    const handleSaveJob = (jobData: Omit<Job, 'id'> & { id?: string }) => {
        if (editingJob && jobData.id) {
            updateJob(jobData as Job);
        } else {
            addJob(jobData);
        }
        setEditingJob(null);
        setJobModalOpen(false);
    };

    const handleEditJob = (job: Job) => {
        setEditingJob(job);
        setJobModalOpen(true);
    };

    const handleDeleteJob = (jobId: string) => {
        deleteJob(jobId);
        deleteAnalysis(jobId);
        setJobImageFiles(prev => {
            const newJobImageFiles = { ...prev };
            delete newJobImageFiles[jobId];
            return newJobImageFiles;
        });
        setStoredImages(prev => {
            const newStoredImages = { ...prev };
            delete newStoredImages[jobId];
            return newStoredImages;
        });
    }

    const handleAddManualShift = (shift: Omit<Shift, 'id'>) => {
        addManualShift(shift);
        setAddShiftModalOpen(false);
    };

    const handleEditShift = (shift: Shift) => {
        setShiftToEdit(shift);
        setEditShiftModalOpen(true);
    };

    const handleSaveEditedShift = (shift: Shift) => {
        editShift(shift);
        setEditShiftModalOpen(false);
        setShiftToEdit(null);
    };

    const handleDeleteShift = (shiftId: string) => {
        deleteShift(shiftId);
    };

    const handleExportPDF = async () => {
        if (!currentData || !selectedJob) return;
        await exportToPDF(currentData, selectedJob, chartsRef.current);
    };

    const handleExportCSV = () => {
        if (!currentData || !selectedJob) return;
        exportToCSV(currentData, selectedJob);
    };

    if (!hasStarted) {
        return <WelcomeScreen onStart={() => setHasStarted(true)} />;
    }

    return (
        <div className="min-h-screen container mx-auto p-4 lg:p-8">
            <header className="text-center mb-10 relative">
                <div className="absolute top-0 left-0">
                    <ThemeToggle isDark={isDark} onToggle={toggleDarkMode} />
                </div>
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Cuentas Claras</h1>
                <p className="text-text-muted mt-2">Sube, analiza y visualiza tu pago con el poder de la IA.</p>
                {currentData && selectedJob && (
                    <div className="absolute top-0 right-0">
                        <ExportMenu
                            onExportPDF={handleExportPDF}
                            onExportCSV={handleExportCSV}
                            disabled={loading}
                        />
                    </div>
                )}
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <aside className="space-y-6">
                    <JobManager
                        jobs={jobs}
                        selectedJobId={selectedJobId}
                        onSelectJob={selectJob}
                        onAddJob={() => { setEditingJob(null); setJobModalOpen(true); }}
                        onEditJob={handleEditJob}
                        onDeleteJob={handleDeleteJob}
                        disabled={loading}
                    />
                    <ImageUploader
                        files={selectedJobFiles}
                        onImageUpload={handleImageUpload}
                        disabled={loading}
                    />
                    <Button
                        onClick={() => analyzeImages(selectedJobFiles)}
                        disabled={selectedJobFiles.length === 0 || loading || !selectedJob}
                        className="w-full !py-3 text-lg"
                    >
                        {loading ? 'Analizando...' : 'Analizar Hoja de Tiempo'}
                    </Button>
                    <Button
                        onClick={() => setAddShiftModalOpen(true)}
                        disabled={loading || !selectedJob}
                        variant="secondary"
                        className="w-full !py-3 text-lg"
                    >
                        + Agregar Turno Manualmente
                    </Button>
                    {error && <p className="text-error text-center mt-4 bg-error/10 p-3 rounded-md border border-error/20">{error}</p>}
                </aside>

                <section className="space-y-6">
                    {loading && <Spinner message="Analizando tu hoja de tiempo con IA..." />}
                    {!loading && !currentData && (
                        <Card className="h-full flex items-center justify-center">
                            <div className="text-center text-text-muted py-8">
                                <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-surface-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                    </svg>
                                </div>
                                <p className="text-base font-medium text-text">Tus resultados aparecerán aquí</p>
                                <p className="text-sm mt-1">Configura un trabajo, sube una hoja de tiempo y presiona Analizar.</p>
                            </div>
                        </Card>
                    )}
                    {currentData && (
                        <>
                            {globalSummary && (
                                <GlobalSummaryCard
                                    totalPayDetails={globalSummary.totalPayDetails}
                                    totalJobsAnalyzed={globalSummary.totalJobsAnalyzed}
                                />
                            )}
                            {!jobs.find(j => j.id === currentData.jobId) && (
                                <div className="text-sm text-text-muted bg-surface-hover border border-surface-border rounded-xl px-4 py-3">
                                    El trabajo de este análisis fue eliminado. Los datos se conservan pero no se puede recalcular.
                                </div>
                            )}
                            <SummaryCard
                                payDetails={currentData.payDetails}
                                job={jobs.find(j => j.id === currentData.jobId)}
                            />
                            <div ref={chartsRef}>
                                {Object.keys(parsedDataByJob).length > 1 && <CombinedEarningsChart jobs={jobs} data={parsedDataByJob} />}
                                <HoursChart shifts={currentData.shifts} />
                            </div>
                            <ExplanationCard summary={currentData.summary} />
                            <ShiftHistory
                                shifts={currentData.shifts}
                                primaryRate={selectedJob ? parseFloat(selectedJob.primaryRate) : undefined}
                                onEditShift={handleEditShift}
                                onDeleteShift={handleDeleteShift}
                            />
                        </>
                    )}
                </section>
            </main>

            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                onConfirm={confirmReview}
                initialShifts={dataForReview?.shifts || []}
            />
            <JobModal
                isOpen={isJobModalOpen}
                onClose={() => { setEditingJob(null); setJobModalOpen(false); }}
                onSave={handleSaveJob}
                jobToEdit={editingJob}
            />
            <AddShiftModal
                isOpen={isAddShiftModalOpen}
                onClose={() => setAddShiftModalOpen(false)}
                onSave={handleAddManualShift}
            />
            {shiftToEdit && (
                <EditShiftModal
                    isOpen={isEditShiftModalOpen}
                    onClose={() => {
                        setEditShiftModalOpen(false);
                        setShiftToEdit(null);
                    }}
                    onSave={handleSaveEditedShift}
                    shift={shiftToEdit}
                />
            )}
        </div>
    );
}

export default App;