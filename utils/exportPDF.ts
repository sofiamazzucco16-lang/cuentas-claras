import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ParsedShifts, Job } from '../types';

export const exportToPDF = async (
    data: ParsedShifts,
    job: Job,
    chartsContainerRef?: HTMLElement | null
) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let y = margin;

    const addText = (text: string, size = 10, bold = false, color: [number, number, number] = [0, 0, 0]) => {
        pdf.setFontSize(size);
        pdf.setFont('helvetica', bold ? 'bold' : 'normal');
        pdf.setTextColor(...color);
        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        pdf.text(lines, margin, y);
        y += lines.length * (size * 0.38);
    };

    const addRow = (label: string, value: string, bold = false, valueColor: [number, number, number] = [0, 0, 0]) => {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', bold ? 'bold' : 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text(label, margin, y);
        pdf.setTextColor(...valueColor);
        pdf.text(value, pageWidth - margin, y, { align: 'right' });
        pdf.setTextColor(0, 0, 0);
        y += 6;
    };

    const checkPage = (needed = 20) => {
        if (y + needed > pageHeight - margin) {
            pdf.addPage();
            y = margin;
        }
    };

    // Header
    pdf.setFillColor(249, 115, 22);
    pdf.rect(0, 0, pageWidth, 38, 'F');
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('Cuentas Claras', margin, 18);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Reporte de pago — ${job.name}`, margin, 28);
    pdf.text(new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - margin, 28, { align: 'right' });
    y = 48;

    // Info del trabajo
    pdf.setTextColor(0, 0, 0);
    addText(`Trabajo: ${job.name}`, 11, true);
    y += 1;
    const rates = `Tarifa: $${parseFloat(job.primaryRate).toFixed(2)}/hr${job.secondaryRate ? ` · Segunda tarifa: $${parseFloat(job.secondaryRate).toFixed(2)}/hr` : ''}`;
    addText(rates, 9);
    addText(`Federal Income Tax: ${job.federalTaxRate}% · Medicare: 1.45% · Social Security: 6.2%`, 9);
    y += 6;

    // Resumen del cheque
    pdf.setFillColor(255, 251, 240);
    pdf.setDrawColor(249, 115, 22);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(margin, y, pageWidth - 2 * margin, 70, 3, 3, 'FD');
    y += 7;
    addText('RESUMEN DEL CHEQUE', 9, true, [249, 115, 22]);
    y += 2;
    addRow('Horas trabajadas', `${data.payDetails.totalHours.toFixed(2)}h`);
    addRow('Pago por horas', `$${data.payDetails.regularPay.toFixed(2)}`);
    if (data.payDetails.gratuity > 0) addRow('Gratuity (service charge)', `$${data.payDetails.gratuity.toFixed(2)}`);
    if (data.payDetails.tips > 0) addRow('Tips (propinas tarjeta)', `$${data.payDetails.tips.toFixed(2)}`);
    y += 1;
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.2);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 4;
    addRow('TOTAL BRUTO', `$${data.payDetails.grossPay.toFixed(2)}`, true);
    addRow(`Federal Income Tax (${job.federalTaxRate}%)`, `-$${data.payDetails.federalTax.toFixed(2)}`);
    addRow('Medicare (1.45%)', `-$${data.payDetails.medicareTax.toFixed(2)}`);
    addRow('Social Security (6.2%)', `-$${data.payDetails.socialSecurityTax.toFixed(2)}`);
    addRow('Total descuentos', `-$${data.payDetails.totalTaxes.toFixed(2)}`);
    y += 1;
    pdf.setDrawColor(249, 115, 22);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 5;
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(249, 115, 22);
    pdf.text('CHEQUE NETO', margin, y);
    pdf.text(`$${data.payDetails.netPay.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
    pdf.setTextColor(0, 0, 0);
    y += 12;

    // Resumen IA
    if (data.summary) {
        checkPage(30);
        addText('Resumen del análisis', 11, true);
        y += 2;
        const lines = data.summary.split('\n').filter(l => l.trim());
        lines.forEach(line => {
            checkPage(8);
            addText(line, 9, false, [80, 80, 80]);
            y += 1;
        });
        y += 5;
    }

    // Tabla de turnos
    pdf.addPage();
    y = margin;
    addText('Detalle de Turnos', 13, true);
    y += 4;

    const cols = { fecha: margin + 2, horario: margin + 35, tarifa: margin + 75, horas: margin + 100, tips: margin + 120, gratuity: margin + 145 };
    pdf.setFillColor(249, 115, 22);
    pdf.rect(margin, y, pageWidth - 2 * margin, 7, 'F');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('Fecha', cols.fecha, y + 5);
    pdf.text('Horario', cols.horario, y + 5);
    pdf.text('Tarifa', cols.tarifa, y + 5);
    pdf.text('Horas', cols.horas, y + 5);
    pdf.text('Tips', cols.tips, y + 5);
    pdf.text('Gratuity', cols.gratuity, y + 5);
    y += 7;

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    const primaryRate = parseFloat(job.primaryRate);

    data.shifts.forEach((shift, i) => {
        checkPage(8);
        if (i % 2 === 0) {
            pdf.setFillColor(255, 251, 240);
            pdf.rect(margin, y, pageWidth - 2 * margin, 7, 'F');
        }
        pdf.setFontSize(8);
        pdf.text(shift.date, cols.fecha, y + 5);
        const horario = shift.startTime && shift.endTime ? `${shift.startTime}–${shift.endTime}` : '—';
        pdf.text(horario, cols.horario, y + 5);
        const rate = shift.hourlyRate || primaryRate;
        pdf.text(`$${rate.toFixed(2)}/h`, cols.tarifa, y + 5);
        pdf.text(`${shift.totalHours.toFixed(2)}h`, cols.horas, y + 5);
        pdf.text(shift.tips && shift.tips > 0 ? `$${shift.tips.toFixed(2)}` : '—', cols.tips, y + 5);
        pdf.text(shift.gratuity && shift.gratuity > 0 ? `$${shift.gratuity.toFixed(2)}` : '—', cols.gratuity, y + 5);
        y += 7;
    });

    // Gráficos
    if (chartsContainerRef) {
        pdf.addPage();
        y = margin;
        addText('Gráficos', 13, true);
        y += 5;
        try {
            const canvas = await html2canvas(chartsContainerRef, { scale: 2, backgroundColor: '#fffbf0', logging: false });
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', margin, y, imgWidth, Math.min(imgHeight, pageHeight - y - margin));
        } catch (e) {
            console.error('Error capturando gráficos:', e);
        }
    }

    // Footer
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(7);
        pdf.setTextColor(160, 160, 160);
        pdf.text(`Generado por Cuentas Claras · ${new Date().toLocaleDateString('es-ES')}`, margin, pageHeight - 8);
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    }

    pdf.save(`CuentasClaras_${job.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToCSV = (data: ParsedShifts, job: Job) => {
    const primaryRate = parseFloat(job.primaryRate);
    const headers = ['Fecha', 'Inicio', 'Fin', 'Descanso (h)', 'Tarifa ($/h)', 'Total Horas', 'Tips ($)', 'Gratuity ($)', 'Notas'];
    const rows = data.shifts.map(shift => [
        shift.date,
        shift.startTime,
        shift.endTime,
        shift.breakHours.toString(),
        (shift.hourlyRate || primaryRate).toFixed(2),
        shift.totalHours.toFixed(2),
        (shift.tips || 0).toFixed(2),
        (shift.gratuity || 0).toFixed(2),
        shift.notes || ''
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `CuentasClaras_${job.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
