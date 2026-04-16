import { useState } from 'react';
import { ParsedShifts, ReviewData, Shift } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { useJob } from '../context/JobContext';
import { analyzeFilesWithAI } from '../utils/ai';
import { recalculatePayDetails } from '../utils/calculations';

export const useShiftAnalysis = () => {
    const { selectedJob, selectedJobId, jobs } = useJob();
    const [parsedDataByJob, setParsedDataByJob] = useLocalStorage<Record<string, ParsedShifts>>('cc_parsed_data', {});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [dataForReview, setDataForReview] = useState<ReviewData | null>(null);

    const analyzeImages = async (files: File[]) => {
        if (files.length === 0) {
            setError('Por favor, sube una o más imágenes de la hoja de tiempo primero.');
            return;
        }
        if (!selectedJob) {
            setError('Por favor, selecciona un trabajo para analizar.');
            return;
        }

        setLoading(true);
        setError(null);

        if (selectedJobId) {
            setParsedDataByJob(prev => {
                const newState = { ...prev };
                delete newState[selectedJobId];
                return newState;
            });
        }

        try {
            const primaryRate = selectedJob.primaryRate || '17.00';
            const secondaryRate = selectedJob.secondaryRate ? ` o $${selectedJob.secondaryRate}` : '';
            const prompt = `Analiza las imágenes o PDF de la hoja de tiempo del restaurante "${selectedJob.name}".
La tarifa por hora principal del empleado es $${primaryRate}${secondaryRate}.

Instrucciones:
1. Extrae TODOS los turnos individuales de la hoja de tiempo.
2. Para cada turno busca: fecha, hora de inicio, hora de fin, horas de descanso, total de horas trabajadas.
3. Si la hoja muestra la tarifa por hora de cada turno (ej: $14.00 o $17.00), inclúyela en el campo 'hourlyRate'. Si no aparece, usa 0.
4. Busca propinas de tarjeta de crédito ("Tips Owed", "Credit Card Tips", "Non-Cash Tips") → campo 'tips'.
5. Busca gratuity o service charge → campo 'gratuity'.
6. Si no hay propinas o gratuity, deja en 0. No inventes valores.
7. Escribe el resumen en ESPAÑOL: cantidad de turnos, rango de fechas, total de horas, si hay propinas o gratuity.
8. Devuelve SOLO un JSON con esta estructura, sin texto antes o después:
{
  "shifts": [
    {
      "id": "string-unico",
      "date": "YYYY-MM-DD",
      "startTime": "HH:mm",
      "endTime": "HH:mm",
      "breakHours": 0,
      "totalHours": 0,
      "hourlyRate": 0,
      "tips": 0,
      "gratuity": 0,
      "notes": ""
    }
  ],
  "summary": "Resumen en español"
}`;

            const jsonText = await analyzeFilesWithAI(files, prompt);

            if (!jsonText) {
                throw new Error("La IA devolvió una respuesta vacía. Por favor, inténtalo con una imagen más clara.");
            }

            let parsedData: any;
            try {
                parsedData = JSON.parse(jsonText);
            } catch (jsonError) {
                console.error("Failed to parse JSON response:", jsonText, jsonError);
                throw new Error("La respuesta de la IA no era un JSON válido. Asegúrate de que la imagen de la hoja de tiempo sea clara y legible.");
            }

            const sanitizedShifts = (parsedData.shifts || []).map((shift: any): Shift => ({
                id: String(shift.id || `shift-${Date.now()}-${Math.random()}`),
                date: String(shift.date || ''),
                startTime: String(shift.startTime || ''),
                endTime: String(shift.endTime || ''),
                breakHours: parseFloat(String(shift.breakHours)) || 0,
                totalHours: parseFloat(String(shift.totalHours)) || 0,
                hourlyRate: parseFloat(String(shift.hourlyRate)) || undefined,
                tips: parseFloat(String(shift.tips)) || 0,
                gratuity: parseFloat(String(shift.gratuity)) || 0,
                notes: String(shift.notes || ''),
            }));

            setDataForReview({
                jobId: selectedJob.id,
                shifts: sanitizedShifts,
                summary: parsedData.summary || '',
            });
            setReviewModalOpen(true);

        } catch (e: any) {
            console.error(e);
            setError(`Ocurrió un error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const confirmReview = (confirmedShifts: Shift[]) => {
        if (!dataForReview?.jobId) return;

        const job = jobs.find(j => j.id === dataForReview.jobId);
        if (!job) return;

        const { payDetails, summary } = recalculatePayDetails(confirmedShifts, job);

        setParsedDataByJob(prev => ({
            ...prev,
            [dataForReview.jobId]: {
                jobId: dataForReview.jobId,
                shifts: confirmedShifts,
                summary,
                payDetails,
            },
        }));

        setReviewModalOpen(false);
        setDataForReview(null);
    };

    const deleteAnalysis = (jobId: string) => {
        setParsedDataByJob(prev => {
            const newState = { ...prev };
            delete newState[jobId];
            return newState;
        });
    };

    const addManualShift = (shift: Omit<Shift, 'id'>) => {
        if (!selectedJobId || !selectedJob) return;

        const newShift: Shift = {
            ...shift,
            id: `manual-${Date.now()}-${Math.random()}`
        };

        const currentData = parsedDataByJob[selectedJobId];
        const updatedShifts = currentData ? [...currentData.shifts, newShift] : [newShift];
        const { payDetails, summary } = recalculatePayDetails(updatedShifts, selectedJob);

        setParsedDataByJob(prev => ({
            ...prev,
            [selectedJobId]: {
                jobId: selectedJobId,
                shifts: updatedShifts,
                payDetails,
                summary,
            }
        }));
    };

    const editShift = (updatedShift: Shift) => {
        if (!selectedJobId || !selectedJob) return;

        const currentData = parsedDataByJob[selectedJobId];
        if (!currentData) return;

        const updatedShifts = currentData.shifts.map(s =>
            s.id === updatedShift.id ? updatedShift : s
        );
        const { payDetails, summary } = recalculatePayDetails(updatedShifts, selectedJob);

        setParsedDataByJob(prev => ({
            ...prev,
            [selectedJobId]: { ...currentData, shifts: updatedShifts, payDetails, summary }
        }));
    };

    const deleteShift = (shiftId: string) => {
        if (!selectedJobId || !selectedJob) return;

        const currentData = parsedDataByJob[selectedJobId];
        if (!currentData) return;

        const updatedShifts = currentData.shifts.filter(s => s.id !== shiftId);

        if (updatedShifts.length === 0) {
            deleteAnalysis(selectedJobId);
            return;
        }

        const { payDetails, summary } = recalculatePayDetails(updatedShifts, selectedJob);

        setParsedDataByJob(prev => ({
            ...prev,
            [selectedJobId]: { ...currentData, shifts: updatedShifts, payDetails, summary }
        }));
    };

    return {
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
    };
};
