import React from 'react';
import { Download, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './Button';

interface ExportMenuProps {
    onExportPDF: () => void;
    onExportCSV: () => void;
    disabled?: boolean;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ onExportPDF, onExportCSV, disabled }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="relative">
            <Button
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                variant="secondary"
                className="gap-2"
            >
                <Download size={18} />
                Exportar
            </Button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 mt-2 w-48 bg-surface border border-surface-border rounded-lg shadow-lg z-20 overflow-hidden"
                    >
                        <button
                            onClick={() => {
                                onExportPDF();
                                setIsOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-surface-hover transition-colors flex items-center gap-3 text-text"
                        >
                            <FileText size={18} className="text-primary" />
                            <div>
                                <p className="font-medium text-sm">Exportar PDF</p>
                                <p className="text-xs text-text-muted">Reporte completo</p>
                            </div>
                        </button>
                        <div className="border-t border-surface-border" />
                        <button
                            onClick={() => {
                                onExportCSV();
                                setIsOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-surface-hover transition-colors flex items-center gap-3 text-text"
                        >
                            <FileText size={18} className="text-secondary" />
                            <div>
                                <p className="font-medium text-sm">Exportar CSV</p>
                                <p className="text-xs text-text-muted">Solo datos de turnos</p>
                            </div>
                        </button>
                    </motion.div>
                </>
            )}
        </div>
    );
};
