import React from "react";

export function ThankYou() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Gracias!</h1>
          <p className="text-gray-600 mb-4">
            Su formulario de inspección ha sido enviado exitosamente.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-2">Próximos pasos:</p>
            <ul className="text-left space-y-1">
              <li>• Recibirá un correo de confirmación</li>
              <li>• El PDF ha sido guardado en nuestro sistema</li>
              <li>• Si está en iOS y no se descargó automáticamente, revise si se abrió en una nueva pestaña</li>
            </ul>
          </div>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
