import React from 'react';
import { Job, ParsedShifts } from '../types';
import { Card } from './ResultCard';
import { motion } from 'framer-motion';

interface CombinedEarningsChartProps {
    jobs: Job[];
    data: Record<string, ParsedShifts>;
}

export const CombinedEarningsChart: React.FC<CombinedEarningsChartProps> = ({ jobs, data }) => {
    // Explicitly type the destructured arguments to ensure correct type inference.
    const individualJobData = Object.entries(data).map(([jobId, parsedData]: [string, ParsedShifts]) => {
        const job = jobs.find(j => j.id === jobId);
        return {
            jobName: job?.name || 'Trabajo Desconocido',
            netPay: parsedData.payDetails.netPay,
        };
    }).filter(item => item.netPay > 0);

    if (individualJobData.length <= 1) {
        return null; // Don't show chart for one or zero jobs with data
    }

    const totalNetPay = individualJobData.reduce((sum, job) => sum + job.netPay, 0);

    const chartData = [
        ...individualJobData,
        {
            jobName: 'Total',
            netPay: totalNetPay,
        }
    ];

    const maxPay = Math.max(...chartData.map(d => d.netPay), 1); // Avoid division by zero

    return (
        <Card title="Resumen de Ganancias">
            <div className="flex justify-between items-end h-48 space-x-4 pt-4">
                {chartData.map(({ jobName, netPay }, index) => {
                    const isTotalBar = jobName === 'Total';
                    const barGradient = isTotalBar
                        ? 'from-primary to-purple-500'
                        : 'from-secondary to-pink-500';
                    const barHeightPercent = (netPay / maxPay) * 100;

                    return (
                        <div key={jobName} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${barHeightPercent}%` }}
                                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                                className={`w-full bg-gradient-to-t ${barGradient} rounded-t-md relative`}
                            >
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <div className="bg-surface border border-surface-border text-text text-xs font-bold py-1 px-2 rounded shadow-lg whitespace-nowrap">
                                        ${netPay.toFixed(2)}
                                    </div>
                                </div>
                            </motion.div>
                            <span className={`text-xs mt-2 text-center truncate w-full ${isTotalBar ? 'font-bold text-primary' : 'text-text-muted'}`}>
                                {jobName}
                            </span>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};
