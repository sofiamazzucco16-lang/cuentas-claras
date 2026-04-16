import React from 'react';
import { Card } from './ResultCard';
import { PayDetails } from '../types';
import { StatCard, Icons } from './StatCard';

interface GlobalSummaryCardProps {
    totalPayDetails: PayDetails;
    totalJobsAnalyzed: number;
}

export const GlobalSummaryCard: React.FC<GlobalSummaryCardProps> = ({ totalPayDetails, totalJobsAnalyzed }) => {
    const totalHours = totalPayDetails.regularHours + totalPayDetails.overtimeHours;
    const effectiveTaxRate = totalPayDetails.grossPay > 0
        ? (totalPayDetails.totalTaxes / totalPayDetails.grossPay) * 100
        : 0;

    return (
        <Card title={`Resumen global — ${totalJobsAnalyzed} trabajos`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard
                    label="Cheque neto total"
                    value={`$${totalPayDetails.netPay.toFixed(2)}`}
                    description={`Suma de ${totalJobsAnalyzed} trabajos después de impuestos`}
                    icon={Icons.Wallet}
                    isPrimary
                />
                <StatCard
                    label="Bruto total"
                    value={`$${totalPayDetails.grossPay.toFixed(2)}`}
                    description={`Antes de descuentos`}
                    icon={Icons.Cash}
                />
                <StatCard
                    label="Horas totales"
                    value={totalHours.toFixed(2)}
                    description={`Reg: ${totalPayDetails.regularHours.toFixed(2)}h · Extra: ${totalPayDetails.overtimeHours.toFixed(2)}h`}
                    icon={Icons.Clock}
                />
                <StatCard
                    label="Descuentos totales"
                    value={`$${totalPayDetails.totalTaxes.toFixed(2)}`}
                    description={`Tasa efectiva ${effectiveTaxRate.toFixed(1)}% (Fed + Medicare + SS)`}
                    icon={Icons.Tax}
                />
            </div>
        </Card>
    );
};
