import React from "react";
import { useStore } from "../store/useStore"; // Ajusta la ruta si es necesario
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const authInitialized = useStore((state) => state.authInitialized);

  if (!authInitialized) {
    // Muestra un loader o nada mientras el estado de autenticación se está inicializando
    // desde localStorage. Esto evita un "parpadeo" a la página de login.
    console.log("ProtectedRoute: Waiting for auth state to initialize...");
    return <div>Loading...</div>; // O un componente Spinner más elegante
  }

  if (!isAuthenticated) {
    // Si la inicialización terminó y el usuario no está autenticado, redirige a login.
    console.log(
      "ProtectedRoute: Not authenticated after initialization, redirecting to /login",
    );
    return <Navigate to="/login" replace />;
  }

  // Si la inicialización terminó y el usuario está autenticado, renderiza el contenido protegido.
  console.log("ProtectedRoute: Authenticated, rendering Outlet.");
  return <Outlet />;
};

export default ProtectedRoute;
