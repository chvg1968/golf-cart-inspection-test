import React from "react";
import { PropertyInformation } from "../PropertyInformation";
import { InspectionFormData } from "../../lib/inspection-service";

interface PropertyInfoAdapterProps {
  formData: InspectionFormData | null;
  isGuestView: boolean;
  onPropertyChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Componente adaptador para PropertyInformation
 * Convierte el tipo InspectionFormData al formato esperado por PropertyInformation
 */
export function PropertyInfoAdapter({
  formData,
  isGuestView,
  onPropertyChange,
}: PropertyInfoAdapterProps) {
  if (!formData) return null;

  // Adaptar el formData al formato esperado por PropertyInformation
  const adaptedFormData = {
    property: formData.property,
    cartType: formData.cartType,
    cartNumber: formData.cartNumber || "", // Proporcionar un valor por defecto
  };

  return (
    <PropertyInformation
      formData={adaptedFormData}
      isGuestView={isGuestView}
      onPropertyChange={onPropertyChange}
    />
  );
}
