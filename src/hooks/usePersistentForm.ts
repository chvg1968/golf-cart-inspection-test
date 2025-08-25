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

// iOS Detection utility
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};


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
  const abortControllerRef = useRef<AbortController | null>(null);
  const isSubmittingRef = useRef(false);



  // Load persistent form with iOS optimizations
  const loadPersistentForm = useCallback(
    async (link: string) => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        // Load form with timeout for iOS
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 10000)
        );

        const formPromise = InspectionService.getInspectionFormByLink(link);
        const form = await Promise.race([formPromise, timeoutPromise]) as InspectionFormData;

        if (!form) {
          setError("The requested form does not exist or has expired");
          return;
        }

        // If form is already completed, redirect to thank you page
        if (form.status === "completed") {
          navigate(`/thank-you/${link}`, { replace: true });
          return;
        }

        // Set form data
        setFormData(form);

        // Set selected property
        const property = PROPERTIES.find((p) => p.id === form.property);
        if (property) {
          setSelectedProperty(property);
        }

        // Set diagram points if they exist
        if (form.diagramPoints?.length > 0) {
          // Remove duplicates more efficiently
          const uniquePoints = form.diagramPoints.filter(
            (point, index, self) =>
              index ===
              self.findIndex(
                (p) =>
                  Math.abs(p.x - point.x) < 1 && 
                  Math.abs(p.y - point.y) < 1 && 
                  p.color === point.color,
              ),
          );

          setDiagramPoints(uniquePoints);
          
          // Build history more efficiently
          const newHistory: Point[][] = [[]];
          uniquePoints.forEach((point) => {
            const lastStep = newHistory[newHistory.length - 1];
            newHistory.push([...lastStep, point]);
          });
          
          setDiagramHistory(newHistory);
          setCurrentStep(newHistory.length - 1);
        }
      } catch (error) {
        console.error("Error loading persistent form:", error);
        const errorMessage = error instanceof Error 
          ? `Loading failed: ${error.message}` 
          : "Error loading the form. Please try again.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    },
    [navigate],
  );

  // Load persistent form
  useEffect(() => {
    if (formLink && !loadingRef.current) {
      loadPersistentForm(formLink);
    }
  }, [formLink, loadPersistentForm]);

  // Cleanup effect for iOS memory management
  useEffect(() => {
    return () => {
      // Abort any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Reset submission state
      isSubmittingRef.current = false;
      
      // Clear any pending timeouts
      const timeouts = (window as unknown).__timeouts || [];
      timeouts.forEach((id: number) => clearTimeout(id));
    };
  }, []);

  // Handle form field changes with iOS optimizations
  const handleInputChange = useCallback((
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData(prev => prev ? { ...prev, [name]: value } : null);
    }
  }, [formData]);

  // Handle signature changes with debouncing for iOS
  const handleSignatureChange = useCallback(() => {
    if (signaturePadRef.current && formData) {
      try {
        const signatureData = signaturePadRef.current.toDataURL("image/png");
        setFormData(prev => prev ? { ...prev, signatureData } : null);
      } catch (error) {
        console.warn("Error capturing signature:", error);
      }
    }
  }, [formData]);

  // Handle observations changes
  const handleObservationsChange = useCallback((observations: string) => {
    if (formData) {
      setFormData(prev => prev ? { ...prev, observations } : null);
    }
  }, [formData]);

  // Handle diagram points changes with iOS optimizations
  const handlePointsChange = useCallback((points: Point[]) => {
    setDiagramPoints(points);

    // Update history efficiently
    setDiagramHistory(prev => [
      ...prev.slice(0, currentStep + 1),
      [...points],
    ]);
    setCurrentStep(prev => prev + 1);

    // Update points in form data
    if (formData) {
      setFormData(prev => prev ? { ...prev, diagramPoints: points } : null);
    }
  }, [currentStep, formData]);

  // Undo last diagram change
  const handleUndo = useCallback(() => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      const newPoints = diagramHistory[newStep] || [];
      
      setCurrentStep(newStep);
      setDiagramPoints(newPoints);

      // Update points in form data
      if (formData) {
        setFormData(prev => prev ? { ...prev, diagramPoints: newPoints } : null);
      }
    }
  }, [currentStep, diagramHistory, formData]);

  // Clear diagram
  const handleClear = useCallback(() => {
    setDiagramPoints([]);
    setDiagramHistory([[]]);
    setCurrentStep(0);

    // Update points in form data
    if (formData) {
      setFormData(prev => prev ? { ...prev, diagramPoints: [] } : null);
    }
  }, [formData]);

  // Clear signature with error handling
  const clearSignature = useCallback(() => {
    if (signaturePadRef.current) {
      try {
        signaturePadRef.current.clear();
        
        // Update signature in form data
        if (formData) {
          setFormData(prev => prev ? { ...prev, signatureData: undefined } : null);
        }
      } catch (error) {
        console.warn("Error clearing signature:", error);
      }
    }
  }, [formData]);

  // Optimized handleSubmit for iOS compatibility
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmittingRef.current || !formData || !formLink) {
      if (!formData || !formLink) {
        setError("No form data available to submit");
      }
      return;
    }

    isSubmittingRef.current = true;
    setIsSending(true);
    setError(null);

    // Create abort controller for this submission
    abortControllerRef.current = new AbortController();

    try {
      // Validate signature
      if (signaturePadRef.current?.isEmpty()) {
        setError("Please sign the form before submitting");
        return;
      }

      // Show processing notification
      setNotification({
        type: "success",
        message: "Processing form and generating PDF...",
      });

      // Generate PDF with iOS optimizations
      const pdfData = await generateFormPDF({
        contentRef: formContentRef,
        waitForComplete: true,
      });

      if (!pdfData?.download?.blob || pdfData.download.blob.size === 0) {
        throw new Error("Failed to generate PDF");
      }

      const pdfBlob = pdfData.download.blob;

      // Generate safe filename
      const safeProperty = formData.property
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");
      const safeGuestName = formData.guestName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");
      const timestamp = Date.now();
      const pdfFilename = `${safeProperty}_${safeGuestName}_${timestamp}.pdf`;

      // Upload PDF to Supabase
      const pdfUrl = await uploadPDF(pdfBlob, pdfFilename);
      if (!pdfUrl) {
        throw new Error("Failed to upload PDF");
      }

      // Update form status in database
      await InspectionService.updateInspectionForm(formLink, {
        signatureData: formData.signatureData!,
        observations: formData.observations,
        termsAccepted: true,
        diagramPoints: diagramPoints,
        status: "completed",
      });

      // Update Airtable (non-blocking)
      if (formData.airtable_record_id) {
        AirtableService.updateAirtablePdfLink(
          formData.airtable_record_id,
          pdfUrl,
        ).catch(console.warn);
      }

      // Send emails (non-blocking for iOS performance)
      const emailPromises = [
        // Guest confirmation email
        sendFormEmail("completed-form", {
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
          isAdmin: false,
        }),
        // Admin notification email
        sendFormEmail("completed-form", {
          to_email: formData.guestEmail,
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
        }),
      ];

      // Don't wait for emails on iOS to prevent hanging
      if (isIOS()) {
        Promise.all(emailPromises).catch(console.warn);
      } else {
        await Promise.all(emailPromises);
      }

      // Success notification
      setNotification({
        type: "success",
        message: "Form submitted successfully!",
      });

      // Navigate immediately on iOS, with small delay on other platforms
      const navigationDelay = isIOS() ? 0 : 500;
      
      setTimeout(() => {
        // Use replace instead of push to prevent back button issues on iOS
        navigate(`/thank-you/${formLink}`, {
          replace: true,
          state: {
            pdfUrl,
            filename: pdfFilename,
            guestName: formData.guestName,
          },
        });
      }, navigationDelay);

    } catch (error) {
      console.error("Error submitting form:", error);
      setError(
        error instanceof Error 
          ? `Submission failed: ${error.message}` 
          : "Error submitting form. Please try again."
      );
    } finally {
      setIsSending(false);
      isSubmittingRef.current = false;
      abortControllerRef.current = null;
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

  };
}
