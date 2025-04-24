import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import SignaturePad from 'react-signature-canvas';
import { Property, Point, FormData, PROPERTIES } from '../types';
import { supabase, saveDiagramMarks, getDiagramMarks, uploadPDF } from '../lib/supabase';
import { sendFormEmail } from '../lib/email';
import { sendToAirtable, updateAirtablePdfLink } from '../components/AirtableService';
import { generateFormPDF } from '../components/PDFGenerator';

export function useInspectionForm(id?: string) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    inspectionDate: format(new Date(), 'yyyy-MM-dd'),
    property: '',
    cartType: '',
    cartNumber: '',
    observations: '',
  });

  const [isGuestView, setIsGuestView] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [diagramPoints, setDiagramPoints] = useState<Point[]>([]);
  const [diagramHistory, setDiagramHistory] = useState<Point[][]>([[]]);
  const [currentStep, setCurrentStep] = useState(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string; } | null>(null);

  const signaturePadRef = useRef<SignaturePad>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const formContentRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // Cargar marcas cuando se selecciona una propiedad
  useEffect(() => {
    if (selectedProperty && !isGuestView && !id) {
      loadDiagramMarks(selectedProperty.diagramType).catch(error => {
        console.error('Error loading default diagram marks:', error);
      });
    }
  }, [selectedProperty, isGuestView, id]);

  // Cargar inspección existente
  useEffect(() => {
    if (id && !loadingRef.current) {
      setIsGuestView(true);
      loadInspection(id);
    }
  }, [id]);

  const loadInspection = async (inspectionId: string) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);

    try {
      const { data: inspection, error } = await supabase
        .from('inspections')
        .select('*')
        .eq('id', inspectionId)
        .single();

      if (error) throw error;

      if (inspection) {
        setFormData({
          guestName: inspection.guest_name,
          guestEmail: inspection.guest_email,
          guestPhone: inspection.guest_phone,
          inspectionDate: inspection.inspection_date,
          property: inspection.property,
          cartType: inspection.cart_type,
          cartNumber: inspection.cart_number,
          observations: inspection.observations || '',
        });

        const property = PROPERTIES.find(p => p.id === inspection.property);
        if (property) {
          setSelectedProperty(property);
        }

        if (inspection.diagram_data) {
          const diagramData = inspection.diagram_data as { points: Point[] };
          if (diagramData.points && diagramData.points.length > 0) {
            const uniquePoints = diagramData.points.filter((point, index, self) =>
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
        }

        if (inspection.status === 'completed') {
          navigate('/thank-you');
          return;
        }
      }
    } catch (error) {
      console.error('Error loading inspection:', error);
      alert('Error loading inspection. Please try again.');
      navigate('/');
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  };

  const loadDiagramMarks = async (diagramName: string) => {
    try {
      const points = await getDiagramMarks(diagramName);
      if (points.length > 0) {
        setDiagramPoints(points);
        const newHistory = points.reduce<Point[][]>(
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
      console.error('Error loading diagram marks:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePropertyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const property = PROPERTIES.find(p => p.id === e.target.value);
    if (property) {
      setSelectedProperty(property);
      setFormData(prev => ({
        ...prev,
        property: property.id,
        cartType: property.cartType,
        cartNumber: property.cartNumber
      }));
      setDiagramPoints([]);
      setDiagramHistory([[]]);
      setCurrentStep(0);

      await loadDiagramMarks(property.diagramType);
    }
  };

  const handlePointsChange = async (newPoints: Point[]) => {
    const uniquePoints = newPoints.filter((point, index, self) =>
      index === self.findIndex(p => p.x === point.x && p.y === point.y && p.color === point.color)
    );

    setDiagramPoints(uniquePoints);
    setDiagramHistory(prev => {
      const newHistory = [...prev.slice(0, currentStep + 1), [...uniquePoints]];
      return newHistory;
    });
    setCurrentStep(prev => prev + 1);

    if (selectedProperty && !isGuestView) {
      try {
        await saveDiagramMarks(selectedProperty.diagramType, uniquePoints);
      } catch (error) {
        console.error('Error saving diagram marks:', error);
      }
    }
  };

  const handleUndo = () => {
    if (currentStep > 0) {
      const previousPoints = diagramHistory[currentStep - 1] || [];
      setCurrentStep(prev => prev - 1);
      setDiagramPoints(previousPoints);

      if (selectedProperty) {
        saveDiagramMarks(selectedProperty.diagramType, previousPoints).catch(error => {
          console.error('Error saving diagram marks after undo:', error);
        });
      }
    }
  };

  const handleClear = () => {
    if (!isGuestView) {
      setDiagramPoints([]);
      setDiagramHistory([[]]);
      setCurrentStep(0);

      if (selectedProperty) {
        saveDiagramMarks(selectedProperty.diagramType, []).catch(error => {
          console.error('Error clearing diagram marks:', error);
        });
      }
    }
  };

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      // Validar firma en vista de invitado
      if (isGuestView && !signaturePadRef.current?.toData()?.length) {
        alert('Please sign the form before submitting.');
        return;
      }

      // Generar PDF
      const pdfData = await generateFormPDF({
        contentRef: formContentRef,
        waitForComplete: true
      });

      if (!pdfData) {
        throw new Error('Failed to generate PDF');
      }

      // Subir PDF a Supabase
      const pdfBlob = pdfData.download.blob;
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('PDF blob is empty or invalid');
      }

      const pdfFilename = `${formData.property.toLowerCase().replace(/\s+/g, '_')}_${formData.guestName.toLowerCase().replace(/\s+/g, '_')}_${formData.inspectionDate.replace(/-/g, '_')}.pdf`;
      const pdfUrl = await uploadPDF(pdfBlob, pdfFilename);

      if (!pdfUrl) {
        throw new Error('Failed to upload PDF');
      }

      if (!isGuestView) {
        await handleNewInspection(pdfUrl);
      } else {
        await handleExistingInspection(pdfUrl);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleNewInspection = async (pdfUrl: string) => {
    // Crear nueva inspección
    const { data: newInspection, error: createError } = await supabase
      .from('inspections')
      .insert([
        {
          guest_name: formData.guestName,
          guest_email: formData.guestEmail,
          guest_phone: formData.guestPhone,
          inspection_date: formData.inspectionDate,
          property: formData.property,
          cart_type: formData.cartType,
          cart_number: formData.cartNumber,
          diagram_data: selectedProperty ? {
            points: diagramPoints,
            width: 600,
            height: 400,
            diagramType: selectedProperty.diagramType
          } : null,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (createError) throw createError;

    // Generar form_id y form_link
    const formId = `${formData.guestName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const formLink = `${window.location.origin}/inspection/${newInspection.id}`;

    // Actualizar la inspección
    await supabase
      .from('inspections')
      .update({
        form_id: formId,
        form_link: formLink
      })
      .eq('id', newInspection.id);

    // Enviar a Airtable
    const airtableRecordId = await sendToAirtable({
      guestName: formData.guestName,
      inspectionDate: formData.inspectionDate,
      property: formData.property,
      inspectionStatus: 'Pending'
    }, pdfUrl);

    if (airtableRecordId) {
      await supabase
        .from('inspections')
        .update({ airtable_record_id: airtableRecordId })
        .eq('id', newInspection.id);
    }

    // Enviar email
    await sendFormEmail('guest-form', {
      to_email: formData.guestEmail,
      to_name: formData.guestName,
      from_name: 'Golf Cart Inspection System',
      from_email: 'no-reply@email.golfcartinspection.app',
      property: formData.property,
      cart_type: formData.cartType,
      cart_number: formData.cartNumber,
      inspection_date: formData.inspectionDate,
      form_link: formLink,
      pdf_attachment: pdfUrl,
      diagram_points: diagramPoints
    });

    setNotification({ type: 'success', message: '¡Enlace enviado exitosamente al huésped!' });
    resetForm();
    navigate('/thank-you');
  };

  const handleExistingInspection = async (pdfUrl: string) => {
    if (!id) {
      throw new Error('ID de inspección no proporcionado');
    }

    // Actualizar la inspección
    const { error: updateError } = await supabase
      .from('inspections')
      .update({
        observations: formData.observations,
        signature_data: signaturePadRef.current?.toDataURL(),
        status: 'completed',
        completed_at: new Date().toISOString(),
        diagram_data: {
          points: diagramPoints,
          width: 600,
          height: 400,
          diagramType: selectedProperty?.diagramType
        }
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Obtener datos de la inspección
    const { data: inspectionData } = await supabase
      .from('inspections')
      .select('airtable_record_id')
      .eq('id', id)
      .single();

    // Actualizar Airtable
    if (inspectionData?.airtable_record_id) {
      try {
        await updateAirtablePdfLink(inspectionData.airtable_record_id, pdfUrl);
      } catch (error) {
        console.error('Error actualizando PDF en Airtable:', error);
      }
    }

    // Enviar correos
    await Promise.all([
      sendFormEmail('completed-form', {
        to_email: formData.guestEmail,
        to_name: formData.guestName,
        from_name: 'Golf Cart Inspection System',
        from_email: 'no-reply@email.golfcartinspection.app',
        property: formData.property,
        cart_type: formData.cartType,
        cart_number: formData.cartNumber,
        inspection_date: formData.inspectionDate,
        observations: formData.observations,
        form_id: id,
        isAdmin: false
      }),
      sendFormEmail('completed-form', {
        to_email: formData.guestEmail,
        to_name: formData.guestName,
        from_name: 'Golf Cart Inspection System',
        from_email: 'no-reply@email.golfcartinspection.app',
        property: formData.property,
        cart_type: formData.cartType,
        cart_number: formData.cartNumber,
        inspection_date: formData.inspectionDate,
        observations: formData.observations,
        formId: id,
        pdf_attachment: pdfUrl,
        isAdmin: true,
        skipAdminAlert: true
      })
    ]);

    navigate('/thank-you');
  };

  const resetForm = () => {
    setFormData({
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      inspectionDate: format(new Date(), 'yyyy-MM-dd'),
      property: '',
      cartType: '',
      cartNumber: '',
      observations: ''
    });
    setSelectedProperty(null);
    setDiagramPoints([]);
    setDiagramHistory([[]]);
    setCurrentStep(0);
  };

  return {
    formData,
    isGuestView,
    isSending,
    isLoading,
    selectedProperty,
    diagramPoints,
    diagramHistory,
    currentStep,
    notification,
    signaturePadRef,
    formRef,
    formContentRef,
    handleInputChange,
    handlePropertyChange,
    handlePointsChange,
    handleUndo,
    handleClear,
    clearSignature,
    handleSubmit
  };
} 