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
        // Normal download for other devices
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
          message: "Download started successfully"
        };
      }

      // iOS-specific handling
      const browser = getIOSBrowser();
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onload = function () {
          const dataUrl = reader.result as string;
          setDownloadUrl(dataUrl);

          if (browser === 'safari') {
            // In Safari, try to open in new tab
            const newWindow = window.open(dataUrl, "_blank");
            
            if (newWindow) {
              // Success - PDF opened in new tab
              setTimeout(() => {
                options.onSuccess?.();
                resolve({
                  success: true,
                  needsManualAction: true,
                  message: "PDF opened in new tab. Use the 'Share' button to save it."
                });
              }, 500);
            } else {
              // Blocked - show instructions
              setShowInstructions(true);
              resolve({
                success: false,
                needsManualAction: true,
                message: "Popup blocked. Follow the instructions to download manually."
              });
            }
          } else {
            // For Chrome/Firefox on iOS, show instructions directly
            setShowInstructions(true);
            resolve({
              success: false,
              needsManualAction: true,
              message: "Manual download required in this browser."
            });
          }
        };

        reader.onerror = function (error) {
          console.error("Error reading blob:", error);
          options.onError?.(new Error("Error processing file"));
          resolve({
            success: false,
            needsManualAction: false,
            message: "Error processing file"
          });
        };

        reader.readAsDataURL(blob);
      });

    } catch (error) {
      console.error("Download error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      options.onError?.(new Error(errorMessage));
      
      return {
        success: false,
        needsManualAction: false,
        message: `Error during download: ${errorMessage}`
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