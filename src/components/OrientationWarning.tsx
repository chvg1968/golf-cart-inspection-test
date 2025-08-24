import React, { useEffect, useState } from "react";
import "../styles/orientation-warning.css";

/**
 * Shows a warning if the device is in portrait mode and screen is small.
 */
const OrientationWarning: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Limpieza de logs de depuración
    return () => {};
  }, []);

  useEffect(() => {
    function handleOrientationChange() {
      const isPortrait = window.matchMedia("(orientation: portrait)").matches;
      const isSmallScreen = window.innerWidth < 768; // Solo mostrar en pantallas pequeñas
      setShow(isPortrait && isSmallScreen);
    }
    
    // Verificar inmediatamente
    handleOrientationChange();
    
    // Agregar listeners con debounce para evitar múltiples llamadas
    let timeoutId: NodeJS.Timeout;
    const debouncedHandler = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleOrientationChange, 100);
    };
    
    window.addEventListener("resize", debouncedHandler);
    window.addEventListener("orientationchange", debouncedHandler);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", debouncedHandler);
      window.removeEventListener("orientationchange", debouncedHandler);
    };
  }, []);

  if (!show) return null;
  return (
    <div className="orientation-warning">
      For a better experience, please rotate your device to landscape.
    </div>
  );
};

export default OrientationWarning;
