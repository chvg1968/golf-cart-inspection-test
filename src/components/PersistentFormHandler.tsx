import React from "react";
import OrientationWarning from "./OrientationWarning";
import { useParams } from "react-router-dom";
import { usePersistentForm } from "../hooks/usePersistentForm";
import { LoadingSpinner } from "./LoadingSpinner";
import { DiagramCanvas } from "./DiagramCanvas";
import { SignatureSection } from "./SignatureSection";
import { GuestInfoAdapter } from "./adapters/GuestInfoAdapter";
import { PropertyInfoAdapter } from "./adapters/PropertyInfoAdapter";
import { IOSDebugInfo } from "./IOSDebugInfo";

/**
 * Componente para manejar formularios persistentes
 * Este componente carga un formulario por su enlace persistente
 * y lo muestra al usuario, sin depender de JWT
 */
const PersistentFormHandler: React.FC = () => {
  const { formLink } = useParams<{ formLink: string }>();

  // Usar el hook personalizado para manejar el formulario persistente
  const {
    formData,
    isLoading,
    isSending,
    error,
    selectedProperty,
    // No necesitamos diagramPoints directamente en este componente
    diagramHistory,
    currentStep,
    notification,
    signaturePadRef,
    formRef,
    formContentRef,
    handleInputChange,
    handleSignatureChange,
    handleObservationsChange,
    handleUndo,
    handleClear,
    handlePointsChange,
    clearSignature,
    handleSubmit,
    // Nuevas propiedades para iOS
    showIOSInstructions,
    hideIOSInstructions,
    openPDF,
    isIOSDevice,
  } = usePersistentForm({ formLink });

  // Mostrar advertencia de orientación en móviles
  // Esto asegura que el mensaje se muestre también en el flujo del cliente
  // y mantiene la UI consistente

  // Renderiza la advertencia de orientación SIEMPRE en la pantalla de formulario persistente
  // (antes de cualquier return condicional)
  // Esto permite que el mensaje se muestre correctamente en móviles y simuladores

  const orientationWarning = <OrientationWarning />;

  if (isLoading) {
    return (
      <>
        {orientationWarning}
        <LoadingSpinner />
      </>
    );
  }

  if (error) {
    return (
      <>
        {orientationWarning}
        <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <a
            href="/"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
          >
            Back to Home
          </a>
        </div>
      </>
    );
  }

  if (!formData) {
    return (
      <>
        {orientationWarning}
        <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Form Not Found</h2>
          <p className="text-gray-700 mb-4">
            The requested form could not be found. The link may be incorrect or expired.
          </p>
          <a
            href="/"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
          >
            Back to Home
          </a>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {notification && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-40 ${
            notification.type === "success" 
              ? "bg-green-100 text-green-800" 
              : notification.type === "warning"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
          role="alert"
        >
          {notification.message}
        </div>
      )}

      {/* Modal de instrucciones para iOS */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                iOS Instructions
              </h3>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <p className="font-medium">To save the PDF on your iPhone/iPad:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Tap the "Open PDF" button below</li>
                <li>The PDF will open in a new tab</li>
                <li>Tap the "Share" button (square with arrow pointing up)</li>
                <li>Select "Save to Files" or "Save to Photos"</li>
              </ol>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={openPDF}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                📄 Open PDF
              </button>
              <button
                type="button"
                onClick={hideIOSInstructions}
                className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div ref={formContentRef}>
          <div className="flex flex-col items-center mb-8">
            <img
              src="/diagrams/logo.png"
              alt="Golf Cart Inspection Logo"
              className="h-32 mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900 text-center">
              Golf Cart Inspection
            </h1>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
            <GuestInfoAdapter
              formData={formData}
              isGuestView={true}
              onInputChange={handleInputChange}
            />

            <PropertyInfoAdapter
              formData={formData}
              isGuestView={true}
              onPropertyChange={() => {}}
            />

            {selectedProperty ? (
              <DiagramCanvas
                isGuestView={true}
                selectedProperty={selectedProperty}
                history={diagramHistory}
                currentStep={currentStep}
                onUndo={handleUndo}
                onClear={handleClear}
                onPointsChange={handlePointsChange}
              />
            ) : (
              <div className="text-center text-gray-500">
                Loading diagram...
              </div>
            )}

            <SignatureSection
              isGuestView={true}
              observations={formData.observations || ""}
              onObservationsChange={(e) =>
                handleObservationsChange(e.target.value)
              }
              signaturePadRef={signaturePadRef}
              onClearSignature={clearSignature}
              onSignatureChange={handleSignatureChange}
            />

            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                disabled={isSending}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? "Processing..." : "Sign and Download PDF"}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Componente de debug solo visible en iOS */}
      <IOSDebugInfo />
    </div>
  );
};

export default PersistentFormHandler;
