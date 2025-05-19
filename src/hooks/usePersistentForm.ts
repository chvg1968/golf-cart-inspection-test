import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SignaturePad from 'react-signature-canvas';
import { Point } from '../types';
import { uploadPDF } from '../lib/supabase';
import { sendFormEmail } from '../lib/email';
import { InspectionService, InspectionFormData } from '../lib/inspection-service';
import * as AirtableService from '../components/AirtableService'; // <--- IMPORTACIÓN CAMBIADA
import { generateFormPDF } from '../components/PDFGenerator';
import { PROPERTIES } from '../types';

interface UsePersistentFormProps {
  formLink?: string;
}

interface UsePersistentFormResult {
  formData: InspectionFormData | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  selectedProperty: typeof PROPERTIES[0] | null;
  diagramPoints: Point[];
  diagramHistory: Point[][];
  currentStep: number;
  notification: { type: string; message: string } | null;
  signaturePadRef: React.RefObject<SignaturePad>;
  formRef: React.RefObject<HTMLFormElement>;
  formContentRef: React.RefObject<HTMLDivElement>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSignatureChange: () => void;
  handleObservationsChange: (observations: string) => void;
  handleUndo: () => void;
  handleClear: () => void;
  handlePointsChange: (points: Point[]) => void;
  clearSignature: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function usePersistentForm({ formLink }: UsePersistentFormProps): UsePersistentFormResult {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<InspectionFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<typeof PROPERTIES[0] | null>(null);
  const [diagramPoints, setDiagramPoints] = useState<Point[]>([]);
  const [diagramHistory, setDiagramHistory] = useState<Point[][]>([[]]);
  const [currentStep, setCurrentStep] = useState(0);
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);

  const signaturePadRef = useRef<SignaturePad>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const formContentRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // Cargar formulario persistente desde la base de datos
  const loadPersistentForm = useCallback(async (link: string) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);

    try {
      // Cargar el formulario usando el servicio de inspección
      const form = await InspectionService.getInspectionFormByLink(link);
      
      if (!form) {
        setError('El formulario solicitado no existe o ha expirado');
        setIsLoading(false);
        return;
      }

      // Si el formulario ya está completado, redirigir a la página de agradecimiento
      if (form.status === 'completed') {
        navigate('/thank-you');
        return;
      }

      // Establecer los datos del formulario
      setFormData(form);

      // Establecer la propiedad seleccionada
      const property = PROPERTIES.find(p => p.id === form.property);
      if (property) {
        setSelectedProperty(property);
      }

      // Establecer los puntos del diagrama si existen
      if (form.diagramPoints && form.diagramPoints.length > 0) {
        const uniquePoints = form.diagramPoints.filter((point, index, self) =>
          index === self.findIndex(p => p.x === point.x && p.y === point.y && p.color === point.color)
        );

        setDiagramPoints(uniquePoints);
        const newHistory = uniquePoints.reduce<Point[][]>(
          (history, point) => {
            const lastStep = history[history.length - 1] || [];
            return [...history, [...lastStep, point]];
          },
          [[]]
        );
        setDiagramHistory(newHistory);
        setCurrentStep(newHistory.length - 1);
      }
    } catch (error) {
      console.error('Error loading persistent form:', error);
      setError('Error al cargar el formulario. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [navigate]);

  // Cargar formulario persistente
  useEffect(() => {
    if (formLink && !loadingRef.current) {
      loadPersistentForm(formLink);
    }
  }, [formLink, loadPersistentForm]);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Manejar cambios en la firma
  const handleSignatureChange = () => {
    if (signaturePadRef.current && formData) {
      const signatureData = signaturePadRef.current.toDataURL('image/png');
      setFormData({ ...formData, signatureData });
    }
  };

  // Manejar cambios en los términos
  // Manejar cambios en las observaciones
  const handleObservationsChange = (observations: string) => {
    if (formData) {
      setFormData({ ...formData, observations });
    }
  };

  // Manejar cambios en los puntos del diagrama
  const handlePointsChange = (points: Point[]) => {
    setDiagramPoints(points);
    
    // Actualizar el historial
    const newHistory = [...diagramHistory.slice(0, currentStep + 1), [...points]];
    setDiagramHistory(newHistory);
    setCurrentStep(newHistory.length - 1);
    
    // Actualizar los puntos en el formulario
    if (formData) {
      setFormData({ ...formData, diagramPoints: points });
    }
  };

  // Deshacer el último cambio en el diagrama
  const handleUndo = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setDiagramPoints(diagramHistory[currentStep - 1]);
      
      // Actualizar los puntos en el formulario
      if (formData) {
        setFormData({ ...formData, diagramPoints: diagramHistory[currentStep - 1] });
      }
    }
  };

  // Limpiar el diagrama
  const handleClear = () => {
    setDiagramPoints([]);
    setDiagramHistory([[]]);
    setCurrentStep(0);
    
    // Actualizar los puntos en el formulario
    if (formData) {
      setFormData({ ...formData, diagramPoints: [] });
    }
  };

  // Limpiar la firma
  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      
      // Actualizar la firma en el formulario
      if (formData) {
        setFormData({ ...formData, signatureData: undefined });
      }
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData || !formLink) {
      setError('No hay datos de formulario para enviar');
      return;
    }
    
    setIsSending(true);

    try {
      // Validar firma
      if (signaturePadRef.current?.isEmpty()) {
        setError('Por favor, firme el formulario antes de enviarlo');
        setIsSending(false);
        return;
      }

      // Generar PDF
      const pdfData = await generateFormPDF({
        contentRef: formContentRef,
        waitForComplete: true
      });

      if (!pdfData) {
        throw new Error('Error al generar el PDF');
      }

      // Subir PDF a Supabase
      const pdfBlob = pdfData.download.blob;
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('El blob del PDF está vacío o no es válido');
      }

      const pdfFilename = `${formData.property.toLowerCase().replace(/\s+/g, '_')}_${formData.guestName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}.pdf`;
      const pdfUrl = await uploadPDF(pdfBlob, pdfFilename);

      if (!pdfUrl) {
        throw new Error('Error al subir el PDF');
      }

      // Actualizar el formulario en la base de datos
      // Se asume que si el usuario firma y envía, acepta los términos implícitamente.
      await InspectionService.updateInspectionForm(formLink!, { // formLink es el UUID
        signatureData: formData.signatureData!,
        observations: formData.observations,
        termsAccepted: true, // Siempre true al enviar
        diagramPoints: diagramPoints,
        status: 'completed'
      });

      // Actualizar Airtable con el enlace del PDF y cambiar estado a Signed
      if (formData.airtable_record_id && pdfUrl) {
        console.log(`Attempting to update Airtable record: ${formData.airtable_record_id} with PDF: ${pdfUrl}`);
        const airtableUpdated = await AirtableService.updateAirtablePdfLink(formData.airtable_record_id, pdfUrl); // <--- LLAMADA CORREGIDA
        if (!airtableUpdated) {
            console.warn('Airtable status or PDF link could not be updated.');
            // Considera si quieres notificar al usuario o manejar este error de alguna manera específica
        } else {
            console.log('Airtable status and PDF link successfully updated.');
        }
      } else {
          console.warn('Missing airtable_record_id or pdfUrl. Cannot update Airtable.', { airtableId: formData.airtable_record_id, pdf: pdfUrl });
      }

      // Enviar correo electrónico de confirmación
      await sendFormEmail('completed-form', {
        to_email: formData.guestEmail,
        to_name: formData.guestName,
        from_name: 'Golf Cart Inspection System',
        from_email: 'no-reply@email.golfcartinspection.app',
        property: formData.property,
        cart_type: formData.cartType,
        cart_number: formData.cartNumber,
        inspection_date: formData.inspectionDate || new Date().toISOString().split('T')[0],
        pdf_attachment: pdfUrl,
        diagram_points: diagramPoints,
        observations: formData.observations,
        isAdmin: true // Enviar copia a administradores
      });

      // Mostrar notificación de éxito
      setNotification({ type: 'success', message: '¡Formulario enviado exitosamente!' });
      
      // Redirigir a la página de agradecimiento
      navigate('/thank-you');
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      setError('Error al enviar el formulario. Por favor, intente nuevamente.');
    } finally {
      setIsSending(false);
    }
  };

  return {
    formData,
    isLoading,
    isSending,
    error,
    selectedProperty,
    diagramPoints,
    diagramHistory,
    currentStep,
    notification,
    signaturePadRef,
    formRef,
    formContentRef,
    handleInputChange,
    handleSignatureChange,
    handleObservationsChange,
    handleUndo,
    handleClear,
    handlePointsChange,
    clearSignature,
    handleSubmit
  };
}
