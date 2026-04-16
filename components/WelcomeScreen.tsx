import React from 'react';
import { ArrowRight, Upload, BarChart2, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
    onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-background">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-center z-10 max-w-sm w-full"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    className="mb-8 flex justify-center"
                >
                    <img src="/logo.png" alt="Cuentas Claras" className="w-28 h-28 object-contain drop-shadow-lg" />
                </motion.div>

                <h1 className="text-5xl font-bold mb-3 text-text tracking-tight">
                    Cuentas <span className="text-primary">Claras</span>
                </h1>
                <p className="text-lg text-text-muted mb-10 font-light">
                    Tu dinero, tus reglas.
                </p>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onStart}
                    className="w-full bg-primary text-white font-semibold py-4 px-8 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:bg-primary-hover transition-all flex items-center justify-center group text-lg"
                >
                    Comenzar Ahora
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <div className="grid grid-cols-3 gap-6 mt-14 border-t border-surface-border pt-10">
                    {[
                        { icon: <Upload size={20} />, label: 'Sube', color: 'text-primary', bg: 'bg-primary/10' },
                        { icon: <BarChart2 size={20} />, label: 'Analiza', color: 'text-secondary', bg: 'bg-secondary/10' },
                        { icon: <DollarSign size={20} />, label: 'Cobra', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    ].map(({ icon, label, color, bg }) => (
                        <div key={label} className="flex flex-col items-center gap-2">
                            <div className={`p-3 ${bg} ${color} rounded-full`}>{icon}</div>
                            <span className="text-xs font-medium text-text-muted">{label}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};
