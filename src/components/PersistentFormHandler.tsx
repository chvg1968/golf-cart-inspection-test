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
 * Component for handling persistent forms
 * This component loads a form by its persistent link
 * and shows it to the user, without depending on JWT
 */
const PersistentFormHandler: React.FC = () => {
  const { formLink } = useParams<{ formLink: string }>();

  // Use the custom hook to handle the persistent form
  const {
    formData,
    isLoading,
    isSending,
    error,
    selectedProperty,
    // We don't need diagramPoints directly in this component
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
    // We no longer need iOS specific properties
  } = usePersistentForm({ formLink });

  // Show orientation warning on mobile devices
  // This ensures that the message is also shown in the client flow
  // and keeps the UI consistent

  // Render the orientation warning ALWAYS on the persistent form screen
  // (before any conditional return)
  // This allows the message to be shown correctly on mobile devices and simulators

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
            The requested form could not be found. The link may be incorrect or
            expired.
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
                {isSending ? "Processing..." : "Sign and Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Debug component only visible on iOS */}
      <IOSDebugInfo />
    </div>
  );
};

export default PersistentFormHandler;
