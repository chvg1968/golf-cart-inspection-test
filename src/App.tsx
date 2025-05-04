// Componente principal de la aplicación
import { Routes, Route, useParams } from 'react-router-dom';
import { GuestInformation } from './components/GuestInformation';
import { PropertyInformation } from './components/PropertyInformation';
import { DiagramCanvas } from './components/DiagramCanvas';
import { SignatureSection } from './components/SignatureSection';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ThankYou } from './components/ThankYou';
import PersistentFormHandler from './components/PersistentFormHandler';
import { useInspectionForm } from './hooks/useInspectionForm';
import './styles/orientation-warning.css';

function InspectionForm() {
  const { id } = useParams();
  const {
    formData,
    isGuestView,
    isSending,
    isLoading,
    selectedProperty,
    diagramHistory,
    currentStep,
    notification,
    signaturePadRef,
    formRef,
    formContentRef,
    handleInputChange,
    handlePropertyChange,
    handlePointsChange,
    handleUndo,
    handleClear,
    clearSignature,
    handleSubmit
  } = useInspectionForm(id);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {notification && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
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
            <GuestInformation
              formData={formData}
              isGuestView={isGuestView}
              onInputChange={handleInputChange}
            />

            <PropertyInformation
              formData={formData}
              isGuestView={isGuestView}
              onPropertyChange={handlePropertyChange}
            />

            {selectedProperty ? (
              <DiagramCanvas
                isGuestView={isGuestView}
                selectedProperty={selectedProperty}
                history={diagramHistory}
                currentStep={currentStep}
                onUndo={handleUndo}
                onClear={handleClear}
                onPointsChange={handlePointsChange}
              />
            ) : (
              <div className="text-center text-gray-500">Cargando diagrama...</div>
            )}

            <SignatureSection
              isGuestView={isGuestView}
              observations={formData.observations}
              onObservationsChange={handleInputChange}
              signaturePadRef={signaturePadRef}
              onClearSignature={clearSignature}
            />

            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                disabled={isSending}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? 'Processing...' : (isGuestView ? 'Sign and Download PDF' : 'Send to Guest')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<InspectionForm />} />
      {/* Nueva ruta para enlaces persistentes - debe ir ANTES de la ruta genérica */}
      <Route path="/inspection/form/:formLink" element={<PersistentFormHandler />} />
      {/* Ruta original para compatibilidad con enlaces existentes */}
      <Route path="/inspection/:id" element={<InspectionForm />} />
      <Route path="/thank-you" element={<ThankYou />} />
    </Routes>
  );
}

export default App;