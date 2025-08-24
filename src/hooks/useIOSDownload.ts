import { useState, useCallback } from "react";
import { isIOS, isSafari, getIOSBrowser } from "../utils/platform";

interface UseIOSDownloadOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showInstructions?: boolean;
}

interface DownloadResult {
  success: boolean;
  needsManualAction: boolean;
  message: string;
}

export const useIOSDownload = (options: UseIOSDownloadOptions = {}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>("");

  const downloadFile = useCallback(async (
    blob: Blob,
    filename: string
  ): Promise<DownloadResult> => {
    setIsDownloading(true);

    try {
      if (!isIOS()) {
        // Descarga normal para otros dispositivos
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        
        options.onSuccess?.();
        return {
          success: true,
          needsManualAction: false,
          message: "Descarga iniciada correctamente"
        };
      }

      // Manejo específico para iOS
      const browser = getIOSBrowser();
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onload = function () {
          const dataUrl = reader.result as string;
          setDownloadUrl(dataUrl);

          if (browser === 'safari') {
            // En Safari, intentar abrir en nueva pestaña
            const newWindow = window.open(dataUrl, "_blank");
            
            if (newWindow) {
              // Éxito - PDF abierto en nueva pestaña
              setTimeout(() => {
                options.onSuccess?.();
                resolve({
                  success: true,
                  needsManualAction: true,
                  message: "PDF abierto en nueva pestaña. Use el botón 'Compartir' para guardarlo."
                });
              }, 500);
            } else {
              // Bloqueado - mostrar instrucciones
              setShowInstructions(true);
              resolve({
                success: false,
                needsManualAction: true,
                message: "Popup bloqueado. Siga las instrucciones para descargar manualmente."
              });
            }
          } else {
            // Para Chrome/Firefox en iOS, mostrar instrucciones directamente
            setShowInstructions(true);
            resolve({
              success: false,
              needsManualAction: true,
              message: "Descarga manual requerida en este navegador."
            });
          }
        };

        reader.onerror = function (error) {
          console.error("Error reading blob:", error);
          options.onError?.(new Error("Error al procesar el archivo"));
          resolve({
            success: false,
            needsManualAction: false,
            message: "Error al procesar el archivo"
          });
        };

        reader.readAsDataURL(blob);
      });

    } catch (error) {
      console.error("Download error:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      options.onError?.(new Error(errorMessage));
      
      return {
        success: false,
        needsManualAction: false,
        message: `Error durante la descarga: ${errorMessage}`
      };
    } finally {
      setIsDownloading(false);
    }
  }, [options]);

  const hideInstructions = useCallback(() => {
    setShowInstructions(false);
    setDownloadUrl("");
  }, []);

  const openPDF = useCallback(() => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    }
  }, [downloadUrl]);

  return {
    downloadFile,
    isDownloading,
    showInstructions,
    downloadUrl,
    hideInstructions,
    openPDF,
    isIOS: isIOS(),
    browser: getIOSBrowser()
  };
};