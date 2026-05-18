import imageCompression from "browser-image-compression";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function optimizeImageBeforeUpload(file: File) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        throw new Error("Format invalid. Acceptăm doar JPG, JPEG, PNG sau WEBP.");
    }

    if (file.size > 10 * 1024 * 1024) {
        throw new Error("Imaginea este prea mare. Max 10MB înainte de optimizare.");
    }

    return imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.82,
    });
}
