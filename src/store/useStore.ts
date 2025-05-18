import { create } from 'zustand';
import { Property, Point, FormData } from '../types'; // Asegúrate que UserType esté definido o impórtalo
import { format } from 'date-fns';
import { saveDiagramMarks } from '../lib/supabase';

// Define un tipo para el usuario si no lo tienes
interface UserType {
  id: string | number;
  userName: string;
  // cualquier otro campo de usuario que necesites
}

interface AuthState {
  currentUser: UserType | null;
  authToken: string | null;
  isAuthenticated: boolean; // Derivado, pero útil tenerlo explícito
  authInitialized: boolean; // Para saber si initializeAuth ya se ejecutó
  login: (user: UserType, token: string) => void;
  logout: () => void;
  initializeAuth: () => void; // Para cargar desde localStorage al inicio
}

interface InspectionStateProperties { // Renombrado para evitar colisión de nombres
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

// Combinar los tipos de estado
export type AppState = InspectionStateProperties & AuthState;

interface InspectionState { // Esto es redundante ahora, AppState es el tipo principal del store

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

export const useStore = create<AppState>((set, get) => ({
  // Estado inicial de autenticación
  currentUser: null,
  authToken: null,
  isAuthenticated: false,
  authInitialized: false, // Inicialmente no sabemos el estado de auth persistido

  // Estado inicial de inspección (como lo tenías)
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

  // Acciones de autenticación
  login: (user, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    set({ currentUser: user, authToken: token, isAuthenticated: true, authInitialized: true });
    console.log('Zustand store: User logged in, state updated.');
  },
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    set({ currentUser: null, authToken: null, isAuthenticated: false, authInitialized: true });
    console.log('Zustand store: User logged out, state cleared.');
    // Aquí también podrías querer redirigir a /login
    // navigate('/login'); // Esto necesitaría acceso a navigate, más complejo en Zustand directamente
  },
  initializeAuth: () => {
    const token = localStorage.getItem('authToken');
    const userDataString = localStorage.getItem('userData');
    if (token && userDataString) {
      try {
        const user: UserType = JSON.parse(userDataString);
        set({ currentUser: user, authToken: token, isAuthenticated: true });
        console.log('Zustand store: Auth initialized from localStorage.');
      } catch (error) {
        console.error("Zustand store: Error parsing user data from localStorage", error);
        // Opcional: limpiar localStorage si está corrupto
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    } else {
      console.log('Zustand store: No auth data in localStorage to initialize.');
    }
    set({ authInitialized: true }); // Marcar como inicializado incluso si no hay nada
  },

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

// Para asegurar que handleUndo, handleClear y handlePointsChange
// tengan acceso al 'get' actualizado después de la refactorización,
// puedes redefinirlos aquí si es necesario o asegurar que la estructura original
// con (set, get) siga siendo válida para ellos.
// Dado que las acciones de autenticación no usan 'get' para llamar a otras acciones internas
// del store, la estructura actual debería estar bien.

// Ejemplo de cómo llamar initializeAuth una vez al cargar la app (ej. en App.tsx o main.tsx):
// useEffect(() => {
//   useStore.getState().initializeAuth();
// }, []);


  