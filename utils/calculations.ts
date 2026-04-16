import { Shift, Job, PayDetails } from '../types';

export interface HoursBreakdown {
    regularHours: number;
    overtimeHours: number;
}

// Regla federal: overtime después de 40 horas por semana
export const calculateHoursBreakdown = (shifts: Shift[]): HoursBreakdown => {
    if (!shifts || shifts.length === 0) {
        return { regularHours: 0, overtimeHours: 0 };
    }

    const getYearWeek = (dateStr: string): string => {
        const date = new Date(`${dateStr}T00:00:00Z`);
        const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        return `${d.getUTCFullYear()}-W${weekNo}`;
    };

    const hoursByWeek: Record<string, number> = {};
    for (const shift of shifts) {
        const week = getYearWeek(shift.date);
        hoursByWeek[week] = (hoursByWeek[week] || 0) + shift.totalHours;
    }

    let weeklyOvertime = 0;
    for (const week in hoursByWeek) {
        const hours = hoursByWeek[week];
        if (hours > 40) {
            weeklyOvertime += hours - 40;
        }
    }

    const totalHours = shifts.reduce((sum, s) => sum + s.totalHours, 0);
    const regularHours = Math.max(0, totalHours - weeklyOvertime);

    return { regularHours, overtimeHours: weeklyOvertime };
};

export const recalculatePayDetails = (
    shifts: Shift[],
    job: Job
): { payDetails: PayDetails; summary: string } => {
    const primaryRate = parseFloat(job.primaryRate) || 0;
    const { regularHours, overtimeHours } = calculateHoursBreakdown(shifts);
    const totalHours = regularHours + overtimeHours;

    // Pagar cada turno a su tarifa individual (shift.hourlyRate) o la primaria
    // El overtime premium (50% extra) se aplica sobre la tarifa primaria
    let regularPay = 0;
    for (const shift of shifts) {
        const rate = shift.hourlyRate || primaryRate;
        regularPay += shift.totalHours * rate;
    }

    // Overtime premium: el 50% adicional sobre la tarifa primaria para las horas extra
    // (el 100% base ya fue pagado en el loop anterior)
    const overtimePay = overtimeHours > 0 ? overtimeHours * primaryRate * 0.5 : 0;

    const gratuity = shifts.reduce((sum, s) => sum + (Number(s.gratuity) || 0), 0);
    const tips = shifts.reduce((sum, s) => sum + (Number(s.tips) || 0), 0);

    const grossPay = regularPay + overtimePay + gratuity + tips;

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
    if (overtimeHours > 0) {
        summaryLines.push(`Horas regulares: ${regularHours.toFixed(2)}h · Horas extra (>40/sem): ${overtimeHours.toFixed(2)}h al 150%.`);
    }
    if (gratuity > 0) summaryLines.push(`Gratuity (service charge): $${gratuity.toFixed(2)}.`);
    if (tips > 0) summaryLines.push(`Propinas con tarjeta: $${tips.toFixed(2)}.`);
    summaryLines.push(`Total bruto: $${grossPay.toFixed(2)} · Descuentos: $${totalTaxes.toFixed(2)} · Cheque neto estimado: $${netPay.toFixed(2)}.`);

    const payDetails: PayDetails = {
        regularHours,
        overtimeHours,
        regularPay,
        overtimePay,
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
