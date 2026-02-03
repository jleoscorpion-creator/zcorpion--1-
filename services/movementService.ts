import { supabase } from './supabaseClient';
import { Expense } from '../types';

export interface Movement {
  id?: string;
  user_id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  frequency?: string;
  created_at?: string;
  updated_at?: string;
}

export const movementService = {
  // Agregar movimiento
  async addMovement(movement: Omit<Movement, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('movements')
      .insert([
        {
          ...movement,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  // Obtener movimientos del usuario
  async getUserMovements(userId: string) {
    const { data, error } = await supabase
      .from('movements')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Actualizar movimiento
  async updateMovement(id: string, movement: Partial<Movement>) {
    const { data, error } = await supabase
      .from('movements')
      .update({
        ...movement,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  // Eliminar movimiento
  async deleteMovement(id: string) {
    const { error } = await supabase
      .from('movements')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Obtener movimientos por categoría
  async getMovementsByCategory(userId: string, category: string) {
    const { data, error } = await supabase
      .from('movements')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtener movimientos en rango de fechas
  async getMovementsInDateRange(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('movements')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
