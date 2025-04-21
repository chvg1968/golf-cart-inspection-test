import { supabase } from './supabase';
import { Point } from '../types';

// Cache para almacenar los puntos por diagrama
const pointsCache = new Map<string, Point[]>();

export async function saveDiagramMarks(diagramId: string, points: Point[]): Promise<void> {
  try {
    console.log('[saveDiagramMarks] Starting save operation:', {
      diagramId,
      pointsCount: points.length
    });

    // Validar y normalizar los puntos antes de guardar
    const normalizedPoints = points.map(point => ({
      x: Number(point.x),
      y: Number(point.y),
      color: String(point.color),
      size: typeof point.size === 'number' ? point.size : 8
    }));

    console.log('[saveDiagramMarks] Points normalized:', {
      sample: normalizedPoints.slice(0, 2),
      total: normalizedPoints.length
    });

    // Buscar si existe un registro para este diagrama
    const { data: existingData, error: selectError } = await supabase
      .from('diagram_marks')
      .select('id')
      .eq('diagram_id', diagramId)
      .maybeSingle();

    if (selectError) {
      console.error('[saveDiagramMarks] Error checking existing record:', selectError);
      return;
    }

    console.log('[saveDiagramMarks] Existing record check:', {
      exists: !!existingData,
      id: existingData?.id
    });

    // Preparar los datos para la operación
    const now = new Date().toISOString();
    const data = {
      diagram_id: diagramId,
      points: normalizedPoints,
      updated_at: now,
      ...(existingData?.id ? {} : { created_at: now })
    };

    // Realizar upsert usando el id como clave
    const { error } = await supabase
      .from('diagram_marks')
      .upsert({
        id: existingData?.id,
        ...data
      });

    if (error) {
      console.error('[saveDiagramMarks] Error in upsert operation:', error);
      return;
    }

    // Actualizar el caché después de guardar
    pointsCache.set(diagramId, normalizedPoints);

    console.log('[saveDiagramMarks] Save operation completed successfully');
  } catch (error) {
    console.error('[saveDiagramMarks] Unexpected error:', error);
  }
}

export async function getDiagramMarks(diagramId: string): Promise<Point[]> {
  try {
    // Verificar si hay datos en caché
    const cached = pointsCache.get(diagramId);
    if (cached) {
      return cached;
    }

    console.log('[getDiagramMarks] Getting marks for:', { diagramId });

    const { data, error } = await supabase
      .from('diagram_marks')
      .select('points')
      .eq('diagram_id', diagramId)
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (error) {
      console.error('[getDiagramMarks] Database error:', error);
      return [];
    }

    console.log('[getDiagramMarks] Raw data from DB:', data);

    // Asegurarse de que los puntos son un array válido
    if (data?.points && Array.isArray(data.points)) {
      const normalizedPoints = data.points.map(point => ({
        x: Number(point.x),
        y: Number(point.y),
        color: String(point.color),
        size: typeof point.size === 'number' ? point.size : 8
      }));

      // Actualizar el caché
      pointsCache.set(diagramId, normalizedPoints);

      console.log('[getDiagramMarks] Normalized points:', {
        count: normalizedPoints.length,
        sample: normalizedPoints.slice(0, 2)
      });

      return normalizedPoints;
    }

    console.log('[getDiagramMarks] No valid points found');
    return [];
  } catch (error) {
    console.error('[getDiagramMarks] Unexpected error:', error);
    return [];
  }
}
