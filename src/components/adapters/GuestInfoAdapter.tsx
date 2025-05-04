import React from 'react';
import { GuestInformation } from '../GuestInformation';
import { InspectionFormData } from '../../lib/inspection-service';

interface GuestInfoAdapterProps {
  formData: InspectionFormData | null;
  isGuestView: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Componente adaptador para GuestInformation
 * Convierte el tipo InspectionFormData al formato esperado por GuestInformation
 */
export function GuestInfoAdapter({ formData, isGuestView, onInputChange }: GuestInfoAdapterProps) {
  if (!formData) return null;

  // Adaptar el formData al formato esperado por GuestInformation
  const adaptedFormData = {
    guestName: formData.guestName,
    guestEmail: formData.guestEmail,
    guestPhone: formData.guestPhone || '', // Proporcionar un valor por defecto
    inspectionDate: formData.inspectionDate || new Date().toISOString().split('T')[0]
  };

  return (
    <GuestInformation
      formData={adaptedFormData}
      isGuestView={isGuestView}
      onInputChange={onInputChange}
    />
  );
}
