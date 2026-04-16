import React from 'react';
import { Card } from './ResultCard';
import { PayDetails, Job } from '../types';
import { Info } from 'lucide-react';

interface SummaryCardProps {
    payDetails: PayDetails;
    job?: Job | null;
}

interface LineRowProps {
    label: string;
    sublabel?: string;
    value: string;
    tooltip?: string;
    isTotal?: boolean;
    isNegative?: boolean;
    accent?: boolean;
    muted?: boolean;
}

const LineRow: React.FC<LineRowProps> = ({ label, sublabel, value, tooltip, isTotal, isNegative, accent, muted }) => (
    <div className={`flex items-start justify-between py-2 ${isTotal ? 'border-t border-surface-border mt-1 pt-3' : ''}`}>
        <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-1.5">
                <span className={`text-sm ${isTotal ? 'font-bold text-text' : muted ? 'text-text-muted' : 'text-text'} ${accent ? 'font-semibold' : ''}`}>
                    {label}
                </span>
                {tooltip && (
                    <div className="group relative flex-shrink-0">
                        <Info size={13} className="text-text-muted cursor-help" />
                        <div className="absolute left-0 bottom-full mb-1 w-56 bg-text text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            {tooltip}
                        </div>
                    </div>
                )}
            </div>
            {sublabel && <p className="text-xs text-text-muted mt-0.5">{sublabel}</p>}
        </div>
        <span className={`text-sm font-semibold flex-shrink-0 ${
            isTotal ? 'text-base font-bold text-text' :
            isNegative ? 'text-error' :
            accent ? 'text-primary' :
            muted ? 'text-text-muted' : 'text-text'
        }`}>
            {isNegative ? `-${value}` : value}
        </span>
    </div>
);

const fmt = (n: number) => `$${n.toFixed(2)}`;
const effectivePct = (pd: PayDetails) =>
    pd.grossPay > 0 ? ((pd.totalTaxes / pd.grossPay) * 100).toFixed(1) : '0';

export const SummaryCard: React.FC<SummaryCardProps> = ({ payDetails, job }) => {
    const primaryRate = parseFloat(job?.primaryRate || '0');
    const federalPct = parseFloat(job?.federalTaxRate || '0');

    return (
        <Card title={`Resumen de pago — ${job?.name || ''}`}>
            {/* Cheque estimado destacado */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Cheque estimado</p>
                <p className="text-4xl font-bold text-primary">{fmt(payDetails.netPay)}</p>
                <p className="text-sm text-text-muted mt-1">
                    {payDetails.totalHours.toFixed(2)} horas trabajadas · {effectivePct(payDetails)}% de descuento total
                </p>
            </div>

            {/* Ganancias */}
            <div className="mb-2">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Ganancias</p>
                <div className="divide-y divide-surface-border/30">
                    <LineRow
                        label="Horas trabajadas"
                        sublabel={`${payDetails.totalHours.toFixed(2)}h × $${primaryRate.toFixed(2)}`}
                        value={fmt(payDetails.regularPay)}
                        tooltip="Tu pago por horas: total de horas trabajadas multiplicado por tu tarifa."
                    />
                    {payDetails.gratuity > 0 && (
                        <LineRow
                            label="Gratuity (service charge)"
                            sublabel="Cargo de servicio distribuido por el restaurante"
                            value={fmt(payDetails.gratuity)}
                            tooltip="El restaurante cobra un cargo de servicio a los clientes y te distribuye una parte. Ya viene calculada por ellos."
                        />
                    )}
                    {payDetails.tips > 0 && (
                        <LineRow
                            label="Tips — propinas con tarjeta"
                            sublabel="Propinas que los clientes dejaron con tarjeta"
                            value={fmt(payDetails.tips)}
                            tooltip="Las propinas pagadas con tarjeta de crédito pasan por el sistema del restaurante y se te acreditan en el cheque."
                        />
                    )}
                    <LineRow
                        label="TOTAL BRUTO"
                        value={fmt(payDetails.grossPay)}
                        isTotal
                    />
                </div>
            </div>

            {/* Descuentos */}
            <div className="mt-5">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                    Descuentos obligatorios por ley
                </p>
                <div className="divide-y divide-surface-border/30">
                    <LineRow
                        label="Federal Income Tax"
                        sublabel={`${federalPct}% de tu salario bruto`}
                        value={fmt(payDetails.federalTax)}
                        isNegative
                        tooltip="Impuesto federal sobre la renta. El porcentaje varía según cuánto ganás en el año. A mayor salario anual, mayor porcentaje."
                    />
                    <LineRow
                        label="Medicare"
                        sublabel="1.45% fijo por ley — seguro médico federal"
                        value={fmt(payDetails.medicareTax)}
                        isNegative
                        muted
                        tooltip="Todos los trabajadores pagan exactamente 1.45% de su salario bruto para financiar Medicare, sin excepciones."
                    />
                    <LineRow
                        label="Social Security"
                        sublabel="6.2% fijo por ley — jubilación federal"
                        value={fmt(payDetails.socialSecurityTax)}
                        isNegative
                        muted
                        tooltip="Todos los trabajadores pagan 6.2% de su salario bruto para el sistema de seguridad social (pensión). Es fijo para todos."
                    />
                    <LineRow
                        label="TOTAL DESCUENTOS"
                        value={fmt(payDetails.totalTaxes)}
                        isNegative
                        isTotal
                    />
                </div>
            </div>

            {/* Resultado final */}
            <div className="mt-5 pt-4 border-t-2 border-primary/30 flex justify-between items-center">
                <div>
                    <p className="text-base font-bold text-text">CHEQUE NETO</p>
                    <p className="text-xs text-text-muted">Lo que te depositan</p>
                </div>
                <p className="text-3xl font-bold text-primary">{fmt(payDetails.netPay)}</p>
            </div>
        </Card>
    );
};
