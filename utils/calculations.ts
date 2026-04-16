import { Shift, Job, PayDetails } from '../types';

export const recalculatePayDetails = (
    shifts: Shift[],
    job: Job
): { payDetails: PayDetails; summary: string } => {
    const primaryRate = parseFloat(job.primaryRate) || 0;

    const totalHours = shifts.reduce((sum, s) => sum + s.totalHours, 0);

    // Pagar cada turno a su tarifa individual (shift.hourlyRate) o la primaria
    const regularPay = shifts.reduce((sum, shift) => {
        const rate = shift.hourlyRate || primaryRate;
        return sum + shift.totalHours * rate;
    }, 0);

    const gratuity = shifts.reduce((sum, s) => sum + (Number(s.gratuity) || 0), 0);
    const tips = shifts.reduce((sum, s) => sum + (Number(s.tips) || 0), 0);

    const grossPay = regularPay + gratuity + tips;

    // Impuestos
    const federalTaxRate = parseFloat(job.federalTaxRate) || 0;
    const federalTax = grossPay * (federalTaxRate / 100);
    const medicareTax = grossPay * 0.0145;       // 1.45% fijo por ley
    const socialSecurityTax = grossPay * 0.062;  // 6.2% fijo por ley
    const totalTaxes = federalTax + medicareTax + socialSecurityTax;
    const netPay = grossPay - totalTaxes;

    // Resumen en español
    const summaryLines: string[] = [
        `${shifts.length} turno${shifts.length !== 1 ? 's' : ''} — ${totalHours.toFixed(2)} horas en total.`,
    ];
    if (gratuity > 0) summaryLines.push(`Gratuity (service charge): $${gratuity.toFixed(2)}.`);
    if (tips > 0) summaryLines.push(`Propinas con tarjeta: $${tips.toFixed(2)}.`);
    summaryLines.push(`Total bruto: $${grossPay.toFixed(2)} · Descuentos: $${totalTaxes.toFixed(2)} · Cheque neto estimado: $${netPay.toFixed(2)}.`);

    const payDetails: PayDetails = {
        totalHours,
        regularPay,
        gratuity,
        tips,
        grossPay,
        federalTax,
        medicareTax,
        socialSecurityTax,
        totalTaxes,
        netPay,
    };

    return { payDetails, summary: summaryLines.join('\n') };
};
