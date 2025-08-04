import React from "react";
import OrientationWarning from "./OrientationWarning";
import { useParams } from "react-router-dom";
import { usePersistentForm } from "../hooks/usePersistentForm";
import { LoadingSpinner } from "./LoadingSpinner";
import { DiagramCanvas } from "./DiagramCanvas";
import { SignatureSection } from "./SignatureSection";
import { GuestInfoAdapter } from "./adapters/GuestInfoAdapter";
import { PropertyInfoAdapter } from "./adapters/PropertyInfoAdapter";

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
            Volver al inicio
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
          <h2 className="text-xl font-bold mb-4">Formulario no encontrado</h2>
          <p className="text-gray-700 mb-4">
            No se pudo encontrar el formulario solicitado. Es posible que el
            enlace sea incorrecto o haya expirado.
          </p>
          <a
            href="/"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
          >
            Volver al inicio
          </a>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {notification && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          role="alert"
        >
          {notification.message}
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
                Cargando diagrama...
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
    </div>
  );
};

export default PersistentFormHandler;
