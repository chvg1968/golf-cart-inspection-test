// Configuración centralizada para el cliente

// Lista para notificaciones de formulario completado/firmado
export const FORM_COMPLETED_ADMIN_EMAILS = [
  "conradovilla@hotmail.com",
  "luxeprbahia@gmail.com"
];

// Función para obtener la lista de administradores para notificaciones de formulario completado
export function getFormCompletedAdminEmails(): string[] {
  return [...FORM_COMPLETED_ADMIN_EMAILS];
}
