import { supabase } from './supabaseClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  displayName?: string;
}

export const authService = {
  // Registro de nuevo usuario
  async signUp(credentials: SignUpCredentials) {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;

    // Crear perfil de usuario en tabla 'profiles'
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: credentials.email,
            display_name: credentials.displayName || credentials.email.split('@')[0],
            created_at: new Date().toISOString(),
          },
        ]);

      if (profileError) throw profileError;
    }

    return data;
  },

  // Login
  async signIn(credentials: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;
    return data;
  },

  // Logout
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Obtener usuario actual
  async getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  // Obtener sesión actual
  async getCurrentSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  // Recuperar contraseña
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },
};
