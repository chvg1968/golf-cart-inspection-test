import { FC, useEffect, useRef } from "react";
import SignaturePad from "react-signature-canvas";

interface PassiveSignaturePadProps {
  canvasProps: React.DetailedHTMLProps<
    React.CanvasHTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  >;
  signaturePadRef: React.RefObject<SignaturePad>;
}

export const PassiveSignaturePad: FC<PassiveSignaturePadProps> = ({
  canvasProps,
  signaturePadRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const options: AddEventListenerOptions = {
      passive: true,
    };

    const noop = () => undefined;

    container.addEventListener("touchstart", noop, options);
    container.addEventListener("touchmove", noop, options);

    return () => {
      container.removeEventListener("touchstart", noop, options);
      container.removeEventListener("touchmove", noop, options);
    };
  }, []);

  return (
    <div ref={containerRef} className="signature-pad-container">
      <SignaturePad ref={signaturePadRef} canvasProps={canvasProps} />
    </div>
  );
};
