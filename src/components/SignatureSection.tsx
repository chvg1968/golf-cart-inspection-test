import React, { useEffect, useRef } from "react";
import SignaturePad from "react-signature-canvas";
import { Eraser } from "lucide-react";
import { PassiveSignaturePad } from "./PassiveSignaturePad";

interface SignatureSectionProps {
  isGuestView: boolean;
  observations: string;
  onObservationsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  signaturePadRef: React.RefObject<SignaturePad>;
  onClearSignature: () => void;
  // Propiedades opcionales para el formulario persistente
  onSignatureChange?: () => void;
}

export function SignatureSection({
  isGuestView,
  observations,
  onObservationsChange,
  signaturePadRef,
  onClearSignature,
  onSignatureChange,
}: SignatureSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Estado local para el checkbox
  const [localChecked, setLocalChecked] = React.useState(false);

  useEffect(() => {
    const resizeCanvas = () => {
      if (signaturePadRef.current && containerRef.current) {
        const canvas = signaturePadRef.current.getCanvas();
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = containerRef.current.offsetWidth * ratio;
        canvas.height = 150 * ratio;
        canvas.getContext("2d")?.scale(ratio, ratio);
        signaturePadRef.current.clear();
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [signaturePadRef]);

  return (
    <section className="space-y-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-700">
        Terms and Signature
      </h2>

      <div className="space-y-6">
        {/* Observations - Always enabled */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {isGuestView ? "Observations" : "Notes for the Guest"}
          </label>
          <textarea
            name="observations"
            value={observations}
            onChange={onObservationsChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder={
              isGuestView
                ? "Enter any observations about the cart condition..."
                : "Add any notes for the guest..."
            }
          />
        </div>

        {/* Terms */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            I hereby certify that the golf cart described above was granted to
            me on the date mentioned, and I acknowledge the stated damages. Any
            additional damages not listed are new and are considered my
            responsibility.
          </p>
        </div>
        <div>
          <label htmlFor="terms-checkbox" className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sms-consent"
              name="sms_consent"
              // Estado local para el checkbox
              value = "yes"
              defaultChecked={false}
              required
            />
            <p className="text-sm text-gray-600">
              I agree to receive SMS from Luxe Properties
              containing essential reservation-related notifications (e.g., inspection forms, 
              access instructions). Standard rates may apply. Reply STOP to opt out.</p>
          </label>
        </div>

        {/* Signature */}
        <div ref={containerRef} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Signature
          </label>
          <div className="border border-gray-300 rounded-lg bg-white">
            <PassiveSignaturePad
              signaturePadRef={signaturePadRef}
              canvasProps={{
                className: "signature-canvas w-full rounded-lg",
                style: {
                  width: "100%",
                  height: "150px",
                  maxWidth: "100%",
                  minHeight: "150px",
                  backgroundColor: "white",
                  cursor: "crosshair",
                },
                // Usar onChange para capturar cambios en la firma
                onChange: () => onSignatureChange && onSignatureChange(),
              }}
            />
          </div>
          <button
            type="button"
            onClick={onClearSignature}
            className="mt-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 inline-flex items-center text-sm"
          >
            <Eraser className="w-4 h-4 mr-2" />
            Clear Signature
          </button>
        </div>
      </div>
    </section>
  );
}
