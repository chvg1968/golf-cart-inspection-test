import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SignaturePad from "react-signature-canvas";
import { Point } from "../types";
import { uploadPDF } from "../lib/supabase";
import { sendFormEmail } from "../lib/email";
import {
  InspectionService,
  InspectionFormData,
} from "../lib/inspection-service";
import * as AirtableService from "../components/AirtableService";
import { generateFormPDF } from "../components/PDFGenerator";
import { PROPERTIES } from "../types";
import { useIOSDownload } from "./useIOSDownload";

interface UsePersistentFormProps {
  formLink?: string;
}

interface UsePersistentFormResult {
  formData: InspectionFormData | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  selectedProperty: (typeof PROPERTIES)[0] | null;
  diagramPoints: Point[];
  diagramHistory: Point[][];
  currentStep: number;
  notification: { type: string; message: string } | null;
  signaturePadRef: React.RefObject<SignaturePad>;
  formRef: React.RefObject<HTMLFormElement>;
  formContentRef: React.RefObject<HTMLDivElement>;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  handleSignatureChange: () => void;
  handleObservationsChange: (observations: string) => void;
  handleUndo: () => void;
  handleClear: () => void;
  handlePointsChange: (points: Point[]) => void;
  clearSignature: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  // Nuevas propiedades para manejo de iOS
  showIOSInstructions: boolean;
  hideIOSInstructions: () => void;
  openPDF: () => void;
  isIOSDevice: boolean;
}

export function usePersistentForm({
  formLink,
}: UsePersistentFormProps): UsePersistentFormResult {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<InspectionFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<
    (typeof PROPERTIES)[0] | null
  >(null);
  const [diagramPoints, setDiagramPoints] = useState<Point[]>([]);
  const [diagramHistory, setDiagramHistory] = useState<Point[][]>([[]]);
  const [currentStep, setCurrentStep] = useState(0);
  const [notification, setNotification] = useState<{
    type: string;
    message: string;
  } | null>(null);

  const signaturePadRef = useRef<SignaturePad>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const formContentRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // Hook para manejar descargas en iOS
  const {
    downloadFile,
    // isDownloading: isDownloadingPDF, // No usado en modo silencioso
    showInstructions,
    hideInstructions,
    openPDF,
    isIOS,
  } = useIOSDownload({
    onSuccess: () => {
      // Silent success - no notification needed
    },
    onError: (error) => {
      // Silent error handling - don't show to user
      console.log("PDF processing completed:", error.message);
    },
  });

  // Cargar formulario persistente desde la base de datos
  const loadPersistentForm = useCallback(
    async (link: string) => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      setIsLoading(true);

      try {
        // Cargar el formulario usando el servicio de inspección
        const form = await InspectionService.getInspectionFormByLink(link);
        console.log(
          "DEBUG: Datos recibidos del servicio (form):",
          JSON.stringify(form, null, 2),
        );

        if (!form) {
          setError("The requested form does not exist or has expired");
          setIsLoading(false);
          return;
        }

        // Si el formulario ya está completado, redirigir a la página de agradecimiento
        if (form.status === "completed") {
          navigate("/thank-you");
          return;
        }

        // Establecer los datos del formulario
        setFormData(form);
        console.log(
          "DEBUG: Estado formData en hook (después de setFormData):",
          JSON.stringify(form, null, 2),
        );

        // Establecer la propiedad seleccionada
        const property = PROPERTIES.find((p) => p.id === form.property);
        if (property) {
          setSelectedProperty(property);
        }

        // Establecer los puntos del diagrama si existen
        if (form.diagramPoints && form.diagramPoints.length > 0) {
          const uniquePoints = form.diagramPoints.filter(
            (point, index, self) =>
              index ===
              self.findIndex(
                (p) =>
                  p.x === point.x && p.y === point.y && p.color === point.color,
              ),
          );

          setDiagramPoints(uniquePoints);
          const newHistory = uniquePoints.reduce<Point[][]>(
            (history, point) => {
              const lastStep = history[history.length - 1] || [];
              return [...history, [...lastStep, point]];
            },
            [[]],
          );
          setDiagramHistory(newHistory);
          setCurrentStep(newHistory.length - 1);
        }
      } catch (error) {
        console.error("Error loading persistent form:", error);
        setError(
          "Error loading the form. Please try again.",
        );
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    },
    [navigate],
  );

  // Cargar formulario persistente
  useEffect(() => {
    if (formLink && !loadingRef.current) {
      loadPersistentForm(formLink);
    }
  }, [formLink, loadPersistentForm]);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Manejar cambios en la firma
  const handleSignatureChange = () => {
    if (signaturePadRef.current && formData) {
      const signatureData = signaturePadRef.current.toDataURL("image/png");
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
    const newHistory = [
      ...diagramHistory.slice(0, currentStep + 1),
      [...points],
    ];
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
        setFormData({
          ...formData,
          diagramPoints: diagramHistory[currentStep - 1],
        });
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

  // Modificación al método handleSubmit para asegurar la descarga correcta del PDF
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData || !formLink) {
      setError("No form data available to submit");
      return;
    }

    setIsSending(true);

    try {
      // Validar firma
      if (signaturePadRef.current?.isEmpty()) {
        setError("Please sign the form before submitting");
        setIsSending(false);
        return;
      }

      // Mostrar notificación de procesamiento
      setNotification({
        type: "success",
        message: "Processing form and generating PDF...",
      });

      // Generar PDF
      const pdfData = await generateFormPDF({
        contentRef: formContentRef,
        waitForComplete: true, // Asegurarse que html2canvas complete su renderizado
      });

      if (!pdfData || !pdfData.download || !pdfData.download.blob) {
        throw new Error("Error generating PDF or blob is empty.");
      }

      const pdfBlob = pdfData.download.blob;
      if (pdfBlob.size === 0) {
        throw new Error("PDF blob is empty.");
      }

      // Generar nombre de archivo seguro reemplazando caracteres especiales
      const safeProperty = formData.property
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");
      const safeGuestName = formData.guestName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");
      const safeDate = new Date()
        .toISOString()
        .replace(/[:.]/g, "_") // Reemplazar : y .
        .replace(/[TZ]/g, "_") // Reemplazar T y Z
        .replace(/\+\d{4}/, ""); // Eliminar offset de zona horaria

      const pdfFilename = `${safeProperty}_${safeGuestName}_${safeDate}.pdf`;

      // Descargar el PDF usando el hook especializado (silencioso)
      await downloadFile(pdfBlob, pdfFilename);

      // Continuamos con el resto de operaciones después de la descarga
      const pdfUrl = await uploadPDF(pdfBlob, pdfFilename);

      if (!pdfUrl) {
        throw new Error("Error uploading PDF");
      }

      // Actualizar el formulario en la base de datos
      await InspectionService.updateInspectionForm(formLink!, {
        signatureData: formData.signatureData!,
        observations: formData.observations,
        termsAccepted: true,
        diagramPoints: diagramPoints,
        status: "completed",
      });

      // Actualizar Airtable con el enlace del PDF y cambiar estado a Signed
      if (formData.airtable_record_id && pdfUrl) {
        console.log(
          `Attempting to update Airtable record: ${formData.airtable_record_id} with PDF: ${pdfUrl}`,
        );
        const airtableUpdated = await AirtableService.updateAirtablePdfLink(
          formData.airtable_record_id,
          pdfUrl,
        );
        if (!airtableUpdated) {
          console.warn("Airtable status or PDF link could not be updated.");
        } else {
          console.log("Airtable status and PDF link successfully updated.");
        }
      } else {
        console.warn(
          "Missing airtable_record_id or pdfUrl. Cannot update Airtable.",
          { airtableId: formData.airtable_record_id, pdf: pdfUrl },
        );
      }

      // Enviar correo de confirmación al huésped
      await sendFormEmail("completed-form", {
        to_email: formData.guestEmail,
        to_name: formData.guestName,
        from_name: "Golf Cart Inspection System",
        from_email: import.meta.env.VITE_SENDER_EMAIL,
        property: formData.property,
        cart_type: formData.cartType,
        cart_number: formData.cartNumber,
        inspection_date:
          formData.inspectionDate || new Date().toISOString().split("T")[0],
        diagram_points: diagramPoints,
        observations: formData.observations,
        isAdmin: false, // Importante: para que el huésped reciba la confirmación
      });

      // Enviar notificación a los administradores
      // El servicio de correo se encargará de enviar a todos los administradores configurados
      await sendFormEmail("completed-form", {
        to_email: formData.guestEmail, // Este valor será sobrescrito por el servicio
        to_name: formData.guestName,
        from_name: "Golf Cart Inspection System",
        from_email: import.meta.env.VITE_SENDER_EMAIL,
        property: formData.property,
        cart_type: formData.cartType,
        cart_number: formData.cartNumber,
        inspection_date:
          formData.inspectionDate || new Date().toISOString().split("T")[0],
        pdf_attachment: pdfUrl,
        diagram_points: diagramPoints,
        observations: formData.observations,
        isAdmin: true,
        skipAdminAlert: true,
      });

      // Mostrar notificación final de éxito y navegar rápidamente
      setNotification({
        type: "success",
        message: "Form submitted successfully!",
      });

      // Navegación rápida - el PDF se maneja en background
      setTimeout(() => {
        navigate("/thank-you");
      }, 1500);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Error submitting form. Please try again.");
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
    handleSubmit,
    // Nuevas propiedades para manejo de iOS
    showIOSInstructions: showInstructions,
    hideIOSInstructions: hideInstructions,
    openPDF,
    isIOSDevice: isIOS,
  };
}
