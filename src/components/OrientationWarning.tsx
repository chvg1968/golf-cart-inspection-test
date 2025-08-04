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
      setShow(isPortrait);
    }
    handleOrientationChange();
    window.addEventListener("resize", handleOrientationChange);
    window.addEventListener("orientationchange", handleOrientationChange);
    return () => {
      window.removeEventListener("resize", handleOrientationChange);
      window.removeEventListener("orientationchange", handleOrientationChange);
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
