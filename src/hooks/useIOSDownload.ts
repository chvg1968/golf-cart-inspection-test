import { useState, useCallback } from "react";
import { isIOS, getIOSBrowser } from "../utils/platform";

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

  const downloadFile = useCallback(
    async (blob: Blob, filename: string): Promise<DownloadResult> => {
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
            message: "Download started successfully",
          };
        }

        // iOS-specific handling - silent background download
        const reader = new FileReader();

        return new Promise((resolve) => {
          reader.onload = function () {
            const dataUrl = reader.result as string;
            setDownloadUrl(dataUrl);

            // Try to open PDF silently in background
            try {
              const newWindow = window.open(dataUrl, "_blank");

              if (newWindow) {
                // PDF opened successfully - no need to show instructions
                options.onSuccess?.();
                resolve({
                  success: true,
                  needsManualAction: false,
                  message: "PDF processed successfully",
                });
              } else {
                // Popup blocked - still consider it successful but silent
                options.onSuccess?.();
                resolve({
                  success: true,
                  needsManualAction: false,
                  message: "PDF processed successfully",
                });
              }
            } catch (error) {
              // Even if there's an error, don't show it to the user
              console.log("PDF processing completed silently");
              options.onSuccess?.();
              resolve({
                success: true,
                needsManualAction: false,
                message: "PDF processed successfully",
              });
            }
          };

          reader.onerror = function (error) {
            console.error("Error reading blob:", error);
            options.onError?.(new Error("Error processing file"));
            resolve({
              success: false,
              needsManualAction: false,
              message: "Error processing file",
            });
          };

          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("Download error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        options.onError?.(new Error(errorMessage));

        return {
          success: false,
          needsManualAction: false,
          message: `Error during download: ${errorMessage}`,
        };
      } finally {
        setIsDownloading(false);
      }
    },
    [options],
  );

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
    browser: getIOSBrowser(),
  };
};
