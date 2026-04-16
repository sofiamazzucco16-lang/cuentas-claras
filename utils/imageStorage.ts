// Utility functions for converting images to/from base64 for localStorage

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to convert file to base64'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

export interface StoredImage {
    base64: string;
    filename: string;
    uploadedAt: string;
}

export const filesToStoredImages = async (files: File[]): Promise<StoredImage[]> => {
    const promises = files.map(async (file) => ({
        base64: await fileToBase64(file),
        filename: file.name,
        uploadedAt: new Date().toISOString()
    }));
    return Promise.all(promises);
};

export const storedImagesToFiles = (storedImages: StoredImage[]): File[] => {
    return storedImages.map(img => base64ToFile(img.base64, img.filename));
};
