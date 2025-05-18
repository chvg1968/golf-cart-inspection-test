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
// useStore ya se importa más abajo o más arriba, eliminando esta duplicación potencial
import './styles/orientation-warning.css';
import OrientationWarning from './components/OrientationWarning';
import Login from './components/Login';
import { useEffect } from 'react'; // useState y supabase ya no son necesarios aquí para auth
// import { supabase } from './lib/supabase'; // Ya no se usa para la lógica de sesión aquí
import { useStore } from './store/useStore'; // ESTA ES LA IMPORTACIÓN QUE DEBE QUEDAR
import ProtectedRoute from './components/ProtectedRoute'; // Importar la ruta protegida
// Navigate se usará dentro de ProtectedRoute y posiblemente para rutas no encontradas

function InspectionForm() {
  const { id } = useParams();
  const zustandLogout = useStore((state) => state.logout);
  const currentUser = useStore((state) => state.currentUser);

  const handleLogout = () => {
    zustandLogout();
    // La redirección a /login es manejada por ProtectedRoute al detectar que isAuthenticated es false
    console.log('Logout solicitado. Estado de Zustand actualizado.');
  };

  const{

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
    <>
      <OrientationWarning />
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
          {currentUser && !isGuestView && (
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">Logged in as: <span className="font-semibold">{currentUser.userName}</span></p>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          )}

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
  </> 
  );
}

function App() {
  // Ya no se usa el estado local loggedIn, se usará el de Zustand

  useEffect(() => {
    // Inicializar el estado de autenticación desde localStorage al cargar la app
    useStore.getState().initializeAuth();
    console.log('App.tsx: Zustand auth initialization requested.');
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Rutas Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<InspectionForm />} />
        {/* Nueva ruta para enlaces persistentes - debe ir ANTES de la ruta genérica */}
        <Route path="/inspection/form/:formLink" element={<PersistentFormHandler />} />
        {/* Ruta original para compatibilidad con enlaces existentes */}
        <Route path="/inspection/:id" element={<InspectionForm />} />
        <Route path="/thank-you" element={<ThankYou />} />
      </Route>
      
      {/* Opcional: Una ruta catch-all para 404 si no está autenticado y no es /login */}
      {/* Esto es más complejo de manejar aquí directamente. ProtectedRoute ya redirige a /login */}
      {/* Si quieres una página 404 específica, considera añadirla fuera de ProtectedRoute */}
      {/* o manejarla dentro de tus componentes de página. */}
      {/* Por ahora, si no está autenticado y no es /login, ProtectedRoute redirigirá a /login. */}
    </Routes>
  );
}

export default App;
