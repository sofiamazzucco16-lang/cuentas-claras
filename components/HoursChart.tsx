import React from 'react';
import { Shift } from '../types';
import { Card } from './ResultCard';
import { motion } from 'framer-motion';

interface HoursChartProps {
    shifts: Shift[];
}

export const HoursChart: React.FC<HoursChartProps> = ({ shifts }) => {
    // FIX: Replaced `reduce` with a `for...of` loop to avoid complex type inference issues.
    // This correctly types `dataByDate`, resolving downstream errors where `hours` was `unknown`.
    const dataByDate: Record<string, number> = {};
    for (const shift of shifts) {
        const date = shift.date;
        if (!dataByDate[date]) {
            dataByDate[date] = 0;
        }
        dataByDate[date] += shift.totalHours;
    }

    // Sort by date before formatting the date string for display.
    const chartData = Object.entries(dataByDate)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, hours]) => ({
            date: new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
            hours,
        }));

    const maxHours = Math.max(...chartData.map(d => d.hours), 8);

    if (chartData.length === 0) {
        return null;
    }

    return (
        <Card title="Horas por Día">
            <div className="flex justify-between items-end h-48 space-x-2 pt-4">
                {chartData.map(({ date, hours }, index) => (
                    <div key={date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(hours / maxHours) * 100}%` }}
                            transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
                            className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-md relative"
                        >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <div className="bg-surface border border-surface-border text-text text-xs font-bold py-1 px-2 rounded shadow-lg whitespace-nowrap">
                                    {hours.toFixed(2)}h
                                </div>
                            </div>
                        </motion.div>
                        <span className="text-xs text-text-muted mt-2 whitespace-nowrap">{date}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
};
