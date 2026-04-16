import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { Card } from './ResultCard';
import { Upload, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploaderProps {
    files: File[];
    onImageUpload: (files: File[]) => void;
    disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ files, onImageUpload, disabled }) => {
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!files || files.length === 0) {
            setImagePreviews([]);
            return;
        }

        const newPreviewPromises = files.map((file: File) => {
            if (file.type === 'application/pdf') {
                return Promise.resolve('pdf');
            }
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        Promise.all(newPreviewPromises).then(previews => {
            setImagePreviews(previews);
        });
    }, [files]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(event.target.files || []);
        if (newFiles.length === 0) return;
        const updatedFiles = [...files, ...newFiles];
        onImageUpload(updatedFiles);
    };

    const handleRemoveImage = (index: number) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        onImageUpload(updatedFiles);
    }

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        fileInputRef.current?.click();
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;

        const droppedFiles = Array.from(e.dataTransfer.files).filter(
            file => file.type.startsWith('image/') || file.type === 'application/pdf'
        );
        if (droppedFiles.length > 0) {
            onImageUpload([...files, ...droppedFiles]);
        }
    };

    return (
        <Card title="Subir Hojas de Tiempo">
            <div className="space-y-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,application/pdf"
                    disabled={disabled}
                    multiple
                />

                <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
                        ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-surface-border hover:border-primary/50 hover:bg-surface-hover'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={!disabled ? handleUploadClick : undefined}
                >
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className={`p-3 rounded-full ${isDragging ? 'bg-primary/20 text-primary' : 'bg-surface-hover text-text-muted'}`}>
                            <Upload size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text">
                                Haz clic para subir o arrastrá aquí
                            </p>
                            <p className="text-xs text-text-muted mt-1">
                                Foto (JPG, PNG) o PDF de Toast
                            </p>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {imagePreviews.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                        >
                            {imagePreviews.map((src, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="relative group aspect-square"
                                >
                                    {src === 'pdf' ? (
                                        <div className="w-full h-full rounded-lg border border-surface-border bg-surface-hover flex flex-col items-center justify-center gap-2">
                                            <FileText size={28} className="text-primary" />
                                            <span className="text-xs text-text-muted font-medium truncate max-w-[90%] px-1">
                                                {files[index]?.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <img src={src} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg border border-surface-border" />
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemoveImage(index); }}
                                        className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error"
                                        disabled={disabled}
                                    >
                                        <X size={14} />
                                    </button>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {files.length > 0 && (
                    <div className="flex justify-end">
                        <p className="text-xs text-text-muted">{files.length} archivo{files.length > 1 ? 's' : ''} seleccionado{files.length > 1 ? 's' : ''}</p>
                    </div>
                )}
            </div>
        </Card>
    );
};