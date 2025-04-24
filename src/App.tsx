import React, { useRef, useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import SignaturePad from 'react-signature-canvas';
import { format } from 'date-fns';
import { Property, PROPERTIES, Point, DiagramData } from './types';
import { supabase, saveDiagramMarks, getDiagramMarks, uploadPDF } from './lib/supabase';
import { GuestInformation } from './components/GuestInformation';
import { PropertyInformation } from './components/PropertyInformation';
import { DiagramCanvas } from './components/DiagramCanvas';
import { SignatureSection } from './components/SignatureSection';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ThankYou } from './components/ThankYou';
import { sendFormEmail } from './lib/email';
import { sendToAirtable, updateAirtablePdfLink } from './components/AirtableService';
import { generateFormPDF } from './components/PDFGenerator';
import './styles/orientation-warning.css';

interface PDFVersion {
  blob: Blob;
  base64: string;
}

interface PDFResult {
  download: PDFVersion;
  email: PDFVersion;
}

interface FormData {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  inspectionDate: string;
  property: string;
  cartType?: string;
  cartNumber: string;
  observations: string;
}

function InspectionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  interface Notification { type: 'success' | 'error'; message: string; }

  const [notification, setNotification] = useState<Notification | null>(null);
  const [isLandscape, setIsLandscape] = useState(true);

  // Efecto para detectar orientación del dispositivo
  useEffect(() => {
    const checkOrientation = () => {
      const isLandscapeMode = window.innerWidth > window.innerHeight;
      setIsLandscape(isLandscapeMode);
    };

    // Verificar orientación inicial
    checkOrientation();

    // Agregar listener para cambios de orientación
    window.addEventListener('resize', checkOrientation);

    // Limpiar listener al desmontar
    return () => {
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  // Limpiar notificación después de 5 segundos
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
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

  const signaturePadRef = useRef<SignaturePad>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const formContentRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // Cargar marcas cuando se selecciona una propiedad
  useEffect(() => {
    if (selectedProperty && !isGuestView && !id) {
      // En modo admin y nueva inspección, cargamos las marcas predefinidas
      loadDiagramMarks(selectedProperty.diagramType).catch(error => {
        console.error('Error loading default diagram marks:', error);
      });
    }
  }, [selectedProperty, isGuestView, id]);

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

        // Primero establecemos los datos del diagrama
        // Cargar las marcas del diagrama
        if (inspection.diagram_data) {
          const diagramData = inspection.diagram_data as DiagramData;
          if (diagramData.points && diagramData.points.length > 0) {
            // Eliminar duplicados de los puntos
            const uniquePoints = diagramData.points.filter((point, index, self) =>
              index === self.findIndex(p => p.x === point.x && p.y === point.y && p.color === point.color)
            );

            setDiagramPoints(uniquePoints);
            // Crear un historial que permita deshacer cada marca
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
        // Crear un historial que permita deshacer cada marca
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
    // Eliminar duplicados antes de guardar
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

  const clearCanvas = () => {
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
        waitForComplete: true // Asegurarse de que el PDF esté completo
      }) as PDFResult | null;

      if (!pdfData) {
        throw new Error('Failed to generate PDF');
      }

      // Subir PDF a Supabase - asegurarse de que el blob esté completo
      const pdfBlob = pdfData.download.blob;
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('PDF blob is empty or invalid');
      }

      const pdfFilename = `${formData.property.toLowerCase().replace(/\s+/g, '_')}_${formData.guestName.toLowerCase().replace(/\s+/g, '_')}_${formData.inspectionDate.replace(/-/g, '_')}.pdf`;
      console.log(`Uploading PDF with filename: ${pdfFilename} and size: ${pdfBlob.size} bytes`);
      const pdfUrl = await uploadPDF(pdfBlob, pdfFilename);

      if (!pdfUrl) {
        throw new Error('Failed to upload PDF');
      }

      if (!isGuestView) {
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

        // Generar form_id y form_link para la nueva inspección
        const formId = `${formData.guestName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
        const pdfFileName = `${formData.property}_${formData.guestName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        const formLink = `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/pdfs/${pdfFileName}`;

        // Actualizar la nueva inspección con form_id y form_link
        const { error: updateError } = await supabase
          .from('inspections')
          .update({
            form_id: formId,
            form_link: formLink
          })
          .eq('id', newInspection.id);

        if (updateError) {
          console.error('Error actualizando form_id y form_link:', updateError);
          throw updateError;
        }

        // Enviar a Airtable y obtener el recordId
        const airtableRecordId = await sendToAirtable({
          guestName: formData.guestName,
          inspectionDate: formData.inspectionDate,
          property: formData.property,
          inspectionStatus: 'Pending'
        }, pdfUrl);

        // Guardar el recordId de Airtable en Supabase
        if (airtableRecordId) {
          await supabase
            .from('inspections')
            .update({ airtable_record_id: airtableRecordId })
            .eq('id', newInspection.id);
        }

        // Enviar email al invitado
        await sendFormEmail('guest-form', {
          to_email: formData.guestEmail,
          to_name: formData.guestName,
          from_name: 'Golf Cart Inspection System',
          from_email: 'no-reply@email.golfcartinspection.app',
          property: formData.property,
          cart_type: formData.cartType,
          cart_number: formData.cartNumber,
          inspection_date: formData.inspectionDate,
          form_link: `${window.location.origin}/inspection/${newInspection.id}`,
          pdf_attachment: pdfUrl,
          diagram_points: diagramPoints
        });

        setNotification({ type: 'success', message: '¡Enlace enviado exitosamente al huésped!' });
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
        navigate('/thank-you');
      } else {
        // Actualizar inspección existente
        if (!id) {
          console.error('No se proporcionó un ID de inspección');
          throw new Error('ID de inspección no proporcionado');
        }

        const { data: inspectionData, error: fetchError } = await supabase
          .from('inspections')
          .select('form_id, form_link, airtable_record_id, diagram_marks_id')
          .eq('id', id)
          .single();

        if (fetchError) {
          console.error('Error obteniendo datos de la inspección:', fetchError);
          throw fetchError;
        }

        // Actualizar la inspección con los datos finales
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

        if (updateError) {
          console.error('Error actualizando la inspección:', updateError);
          throw updateError;
        }

        // Actualizar Airtable si tenemos recordId
        if (inspectionData?.airtable_record_id) {
          try {
            await updateAirtablePdfLink(inspectionData.airtable_record_id, pdfUrl);
            console.log('PDF actualizado en Airtable para recordId:', inspectionData.airtable_record_id);
          } catch (updateError) {
            console.error('Error actualizando PDF en Airtable:', updateError);
          }
        }

        // Enviar correos
        await Promise.all([
          // Correo al huésped
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

          // Correo a administradores
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
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {notification && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          role="alert"
        >
          {notification.message}
        </div>
      )}
      {!isLandscape && (
        <div className="orientation-warning">
          🔄 Please rotate your device to landscape for a better experience
        </div>
      )}
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div ref={formContentRef}>
          <div className="flex flex-col items-center mb-8">
            <img
              src="/diagrams/logo.png"
              alt="Golf Cart Inspection Logo"
              className="h-32 mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900 text-center">
              Golf Cart Inspection
            </h1>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
            <GuestInformation
              formData={formData}
              isGuestView={isGuestView}
              onInputChange={handleInputChange}
            />

            <PropertyInformation
              formData={formData}
              isGuestView={isGuestView}
              onPropertyChange={handlePropertyChange}
            />

            <DiagramCanvas
              isGuestView={isGuestView}
              selectedProperty={selectedProperty}
              history={diagramHistory}
              currentStep={currentStep}
              onUndo={handleUndo}
              onClear={clearCanvas}
              onPointsChange={handlePointsChange}
            />

            <SignatureSection
              isGuestView={isGuestView}
              observations={formData.observations}
              onObservationsChange={handleInputChange}
              signaturePadRef={signaturePadRef}
              onClearSignature={clearSignature}
            />

            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                disabled={isSending}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? 'Processing...' : (isGuestView ? 'Sign and Download PDF' : 'Send to Guest')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<InspectionForm />} />
      <Route path="/inspection/:id" element={<InspectionForm />} />
      <Route path="/thank-you" element={<ThankYou />} />
    </Routes>
  );
}

export default App;