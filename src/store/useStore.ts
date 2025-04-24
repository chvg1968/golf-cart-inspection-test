import { create } from 'zustand';
import { Property, Point, FormData } from '../types';
import { format } from 'date-fns';
import { saveDiagramMarks } from '../lib/supabase';

interface InspectionState {
  // Estado del formulario
  formData: FormData;
  setFormData: (data: Partial<FormData>) => void;
  resetFormData: () => void;

  // Estado de la vista
  isGuestView: boolean;
  setIsGuestView: (isGuest: boolean) => void;
  isSending: boolean;
  setIsSending: (sending: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Estado del diagrama
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  diagramPoints: Point[];
  setDiagramPoints: (points: Point[]) => void;
  diagramHistory: Point[][];
  setDiagramHistory: (history: Point[][]) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;

  // Notificaciones
  notification: { type: 'success' | 'error'; message: string; } | null;
  setNotification: (notification: { type: 'success' | 'error'; message: string; } | null) => void;

  // Acciones del diagrama
  handleUndo: () => void;
  handleClear: () => void;
  handlePointsChange: (newPoints: Point[]) => void;
}

const initialFormData: FormData = {
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  inspectionDate: format(new Date(), 'yyyy-MM-dd'),
  property: '',
  cartType: '',
  cartNumber: '',
  observations: '',
};

export const useStore = create<InspectionState>((set, get) => ({
  // Estado inicial
  formData: initialFormData,
  isGuestView: false,
  isSending: false,
  isLoading: false,
  selectedProperty: null,
  diagramPoints: [],
  diagramHistory: [[]],
  currentStep: 0,
  notification: null,

  // Setters
  setFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),
  resetFormData: () => set({ formData: initialFormData }),
  setIsGuestView: (isGuest) => set({ isGuestView: isGuest }),
  setIsSending: (sending) => set({ isSending: sending }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setSelectedProperty: (property) => set({ selectedProperty: property }),
  setDiagramPoints: (points) => set({ diagramPoints: points }),
  setDiagramHistory: (history) => set({ diagramHistory: history }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setNotification: (notification) => set({ notification }),

  // Acciones del diagrama
  handleUndo: () => {
    const { currentStep, diagramHistory, setCurrentStep, setDiagramPoints, selectedProperty, isGuestView } = get();
    if (currentStep > 0) {
      const previousPoints = diagramHistory[currentStep - 1] || [];
      setCurrentStep(currentStep - 1);
      setDiagramPoints(previousPoints);

      if (selectedProperty && !isGuestView) {
        saveDiagramMarks(selectedProperty.diagramType, previousPoints).catch(error => {
          console.error('Error saving diagram marks after undo:', error);
        });
      }
    }
  },

  handleClear: () => {
    const { isGuestView, setDiagramPoints, setDiagramHistory, setCurrentStep, selectedProperty } = get();
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
  },

  handlePointsChange: (newPoints) => {
    const { currentStep, diagramHistory, setDiagramPoints, setDiagramHistory, setCurrentStep, selectedProperty, isGuestView } = get();
    const uniquePoints = newPoints.filter((point, index, self) =>
      index === self.findIndex(p => p.x === point.x && p.y === point.y && p.color === point.color)
    );

    setDiagramPoints(uniquePoints);
    setDiagramHistory([...diagramHistory.slice(0, currentStep + 1), [...uniquePoints]]);
    setCurrentStep(currentStep + 1);

    if (selectedProperty && !isGuestView) {
      saveDiagramMarks(selectedProperty.diagramType, uniquePoints).catch(error => {
        console.error('Error saving diagram marks:', error);
      });
    }
  },
})); 