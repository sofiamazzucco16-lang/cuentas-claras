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
    let yPosition = margin;

    // Helper function to add text with word wrap
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
        pdf.setFontSize(fontSize);
        if (isBold) {
            pdf.setFont('helvetica', 'bold');
        } else {
            pdf.setFont('helvetica', 'normal');
        }
        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * (fontSize * 0.35);
    };

    // Header
    pdf.setFillColor(249, 115, 22); // Orange
    pdf.rect(0, 0, pageWidth, 40, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Cuentas Claras', margin, 20);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Reporte de Pago', margin, 30);

    // Reset text color
    pdf.setTextColor(0, 0, 0);
    yPosition = 50;

    // Job Information
    addText(`Trabajo: ${job.name}`, 14, true);
    yPosition += 3;
    addText(`Tarifa por hora: $${job.hourlyRate} | Horas extra: $${job.overtimeRate}`, 10);
    addText(`Estado: ${job.state}`, 10);
    yPosition += 5;

    // Summary Section
    pdf.setFillColor(255, 251, 240); // Light cream background
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 50, 'F');
    yPosition += 5;
    addText('Resumen del Período', 12, true);
    yPosition += 3;

    const summaryLines = data.summary.split('\n');
    summaryLines.forEach(line => {
        addText(line, 9);
        yPosition += 1;
    });
    yPosition += 5;

    // Pay Details Section
    addText('Desglose de Pago', 12, true);
    yPosition += 3;

    const payDetails = [
        { label: 'Horas Regulares', value: `${data.payDetails.regularHours.toFixed(2)}h` },
        { label: 'Horas Extra', value: `${data.payDetails.overtimeHours.toFixed(2)}h` },
        { label: 'Pago Regular', value: `$${data.payDetails.regularPay.toFixed(2)}` },
        { label: 'Pago Horas Extra', value: `$${data.payDetails.overtimePay.toFixed(2)}` },
        { label: 'Propinas', value: `$${data.payDetails.tips.toFixed(2)}` },
        { label: 'Gratuity (Neto)', value: `$${data.payDetails.gratuity.toFixed(2)}` },
    ];

    payDetails.forEach(({ label, value }) => {
        pdf.text(label, margin, yPosition);
        pdf.text(value, pageWidth - margin - 40, yPosition);
        yPosition += 6;
    });

    yPosition += 3;
    pdf.setDrawColor(249, 115, 22);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    // Totals
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Pago Bruto Total', margin, yPosition);
    pdf.text(`$${data.payDetails.grossPay.toFixed(2)}`, pageWidth - margin - 40, yPosition);
    yPosition += 6;

    pdf.text('Impuestos Estimados', margin, yPosition);
    pdf.text(`-$${data.payDetails.estimatedTaxes.toFixed(2)}`, pageWidth - margin - 40, yPosition);
    yPosition += 6;

    pdf.setFontSize(13);
    pdf.setTextColor(249, 115, 22);
    pdf.text('Pago Neto Estimado', margin, yPosition);
    pdf.text(`$${data.payDetails.netPay.toFixed(2)}`, pageWidth - margin - 40, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 10;

    // Add new page for shifts table
    pdf.addPage();
    yPosition = margin;

    addText('Detalle de Turnos', 14, true);
    yPosition += 5;

    // Table headers
    pdf.setFillColor(249, 115, 22);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Fecha', margin + 2, yPosition + 5);
    pdf.text('Inicio', margin + 30, yPosition + 5);
    pdf.text('Fin', margin + 50, yPosition + 5);
    pdf.text('Descanso', margin + 70, yPosition + 5);
    pdf.text('Total', margin + 95, yPosition + 5);
    pdf.text('Propinas', margin + 115, yPosition + 5);
    pdf.text('Gratuity', margin + 140, yPosition + 5);
    yPosition += 8;

    // Table rows
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    data.shifts.forEach((shift, index) => {
        if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = margin;
        }

        if (index % 2 === 0) {
            pdf.setFillColor(255, 251, 240);
            pdf.rect(margin, yPosition, pageWidth - 2 * margin, 7, 'F');
        }

        pdf.text(shift.date, margin + 2, yPosition + 5);
        pdf.text(shift.startTime, margin + 30, yPosition + 5);
        pdf.text(shift.endTime, margin + 50, yPosition + 5);
        pdf.text(`${shift.breakHours}h`, margin + 70, yPosition + 5);
        pdf.text(`${shift.totalHours.toFixed(2)}h`, margin + 95, yPosition + 5);
        pdf.text(`$${shift.tips.toFixed(2)}`, margin + 115, yPosition + 5);
        pdf.text(`$${shift.gratuity.toFixed(2)}`, margin + 140, yPosition + 5);
        yPosition += 7;
    });

    // Add charts if available
    if (chartsContainerRef) {
        pdf.addPage();
        yPosition = margin;
        addText('Gráficos de Análisis', 14, true);
        yPosition += 5;

        try {
            const canvas = await html2canvas(chartsContainerRef, {
                scale: 2,
                backgroundColor: '#fffbf0',
                logging: false,
            });
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            if (imgHeight > pageHeight - yPosition - margin) {
                const scaledHeight = pageHeight - yPosition - margin;
                pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, scaledHeight);
            } else {
                pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
            }
        } catch (error) {
            console.error('Error capturing charts:', error);
        }
    }

    // Footer on all pages
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
            `Generado por Cuentas Claras - ${new Date().toLocaleDateString('es-ES')}`,
            margin,
            pageHeight - 10
        );
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
    }

    // Save the PDF
    const fileName = `CuentasClaras_${job.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
};

export const exportToCSV = (data: ParsedShifts, job: Job) => {
    const headers = ['Fecha', 'Hora Inicio', 'Hora Fin', 'Descanso (h)', 'Total Horas', 'Propinas', 'Gratuity', 'Notas'];
    const rows = data.shifts.map(shift => [
        shift.date,
        shift.startTime,
        shift.endTime,
        shift.breakHours.toString(),
        shift.totalHours.toFixed(2),
        shift.tips.toFixed(2),
        shift.gratuity.toFixed(2),
        shift.notes || ''
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `CuentasClaras_${job.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
