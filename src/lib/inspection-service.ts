import { supabase } from './supabase';
import { nanoid } from 'nanoid';
import type { Point } from '../types';

// Tipos para el servicio de inspección
export interface InspectionFormData {
  id?: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string; // Añadido para compatibilidad con componentes existentes
  property: string;
  cartType?: string;
  cartNumber?: string;
  inspectionDate?: string;
  diagramPoints?: Point[];
  observations?: string;
  signatureData?: string;
  termsAccepted?: boolean;
  status?: 'pending' | 'completed';
  formLink?: string;
  airtable_record_id?: string; // Añadido para el ID de Airtable
}

export interface InspectionFormResponse {
  id: string;
  formLink: string;
  status: string;
}

/**
 * Servicio para gestionar formularios de inspección
 * Este enfoque utiliza enlaces persistentes en lugar de JWT
 */
export class InspectionService {
  /**
   * Constante para la URL base de la aplicación
   */
  private static readonly BASE_URL = import.meta.env.VITE_APP_URL || 'https://golf-cart-inspection.netlify.app';
  /**
   * Crea un nuevo formulario de inspección con un enlace persistente
   */
  static async createInspectionForm(data: InspectionFormData): Promise<InspectionFormResponse> {
    try {
      // Generar un ID único para el enlace (no depende de JWT)
      const linkId = nanoid(10); // ID corto pero único para URLs amigables
      const formLink = `inspection/${linkId}`;
      
      // Preparar datos para inserción
      const formData = {
        guest_name: data.guestName,
        guest_email: data.guestEmail,
        property: data.property,
        cart_type: data.cartType || null,
        cart_number: data.cartNumber || null,
        inspection_date: data.inspectionDate || new Date().toISOString().split('T')[0],
        status: 'pending',
        form_link: formLink,
        diagram_data: data.diagramPoints ? { points: data.diagramPoints } : null
      };
      
      // Insertar en la base de datos
      const { data: insertedForm, error } = await supabase
        .from('inspections')
        .insert(formData)
        .select('id, form_link, status')
        .single();
      
      if (error) {
        throw error;
      }
      
      return {
        id: insertedForm.id,
        formLink: insertedForm.form_link,
        status: insertedForm.status
      };
    } catch (error) {
      console.error('Error creating inspection form:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un formulario de inspección por su enlace persistente
   */
  static async getInspectionFormByLink(formLink: string): Promise<InspectionFormData | null> {
    try {
      const { data, error } = await supabase
        .from('inspections') // Cambiado a 'inspections'
        .select('*')
        .eq('form_link', formLink)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró el formulario
          return null;
        }
        throw error;
      }
      
      if (!data) return null;
      
      // Convertir el formato de la base de datos al formato de la aplicación
      return {
        id: data.id,
        guestName: data.guest_name,
        guestEmail: data.guest_email,
        property: data.property,
        cartType: data.cart_type,
        cartNumber: data.cart_number,
        inspectionDate: data.inspection_date,
        diagramPoints: data.diagram_data?.points || [],
        observations: data.observations,
        signatureData: data.signature_data,
        termsAccepted: data.terms_accepted,
        status: data.status as 'pending' | 'completed',
        formLink: data.form_link,
        airtable_record_id: data.airtable_record_id // Añadido para el ID de Airtable
      };
    } catch (error) {
      console.error('Error getting inspection form:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza un formulario de inspección existente
   */
  static async updateInspectionForm(formLink: string, data: Partial<InspectionFormData>): Promise<boolean> {
    try {
      // Convertir datos al formato de la base de datos
      const updateData: Record<string, unknown> = {};
      
      if (data.observations !== undefined) updateData.observations = data.observations;
      if (data.signatureData !== undefined) updateData.signature_data = data.signatureData;
        if (data.diagramPoints !== undefined) updateData.diagram_data = { points: data.diagramPoints };
      
      // Si se están enviando datos de firma y términos, marcar como completado
      if (data.signatureData && data.termsAccepted) {
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('inspections') // Cambiado a 'inspections'
        .update(updateData)
        .eq('form_link', formLink);
      
        if (error) {
          console.error('Supabase error details in updateInspectionForm:', JSON.stringify(error, null, 2));
          throw error;
        }
      
      return true;
    } catch (error) {
      console.error('Error updating inspection form:', error);
      throw error;
    }
  }
  
  /**
   * Genera una URL completa para el formulario
   */
  static getFullFormUrl(formLink: string): string {
    return `${InspectionService.BASE_URL}/${formLink}`;
  }
}
