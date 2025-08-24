import React, { useState } from "react";
import { isIOS, isSafari } from "../utils/platform";

interface IOSPDFHandlerProps {
  pdfBlob: Blob;
  filename: string;
  onComplete: () => void;
}

export const IOSPDFHandler: React.FC<IOSPDFHandlerProps> = ({
  pdfBlob,
  filename,
  onComplete,
}) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");

  const handleIOSDownload = async () => {
    if (!isIOS()) {
      // Fallback para otros dispositivos
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      onComplete();
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = function () {
        const dataUrl = reader.result as string;
        setPdfUrl(dataUrl);

        if (isSafari()) {
          // En Safari, intentar abrir en nueva pestaña
          const newWindow = window.open(dataUrl, "_blank");
          
          if (!newWindow) {
            // Si fue bloqueado, mostrar instrucciones
            setShowInstructions(true);
          } else {
            // Si se abrió, dar instrucciones sobre cómo guardar
            setTimeout(() => {
              alert(
                "PDF abierto en nueva pestaña. Use el botón 'Compartir' (cuadrado con flecha hacia arriba) para guardarlo en su dispositivo."
              );
              onComplete();
            }, 1000);
          }
        } else {
          // Para otros navegadores en iOS
          setShowInstructions(true);
        }
      };
      reader.readAsDataURL(pdfBlob);
    } catch (error) {
      console.error("Error handling iOS PDF download:", error);
      setShowInstructions(true);
    }
  };

  if (!showInstructions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Preparando descarga del PDF
            </h3>
            <p className="text-sm text-gray-600">
              Configurando la descarga para su dispositivo iOS...
            </p>
          </div>
          <button
            onClick={handleIOSDownload}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Descargar PDF
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <div className="text-center mb-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Instrucciones para iOS
          </h3>
        </div>
        
        <div className="space-y-3 text-sm text-gray-600 mb-6">
          <p className="font-medium">Para guardar el PDF en su iPhone/iPad:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Toque el enlace de descarga abajo</li>
            <li>Se abrirá el PDF en una nueva pestaña</li>
            <li>Toque el botón "Compartir" (cuadrado con flecha)</li>
            <li>Seleccione "Guardar en Archivos" o "Guardar en Fotos"</li>
          </ol>
        </div>

        <div className="space-y-3">
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md text-center hover:bg-blue-700"
            >
              📄 Abrir PDF
            </a>
          )}
          <button
            onClick={onComplete}
            className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
          >
            Continuar sin descargar
          </button>
        </div>
      </div>
    </div>
  );
};