import { createClient } from '@supabase/supabase-js';

// Extraemos las credenciales del entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificación de seguridad para evitar que el sistema arranque sin llaves
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase en .env.local');
}

// Creamos el cliente que usaremos en toda la plataforma
export const supabase = createClient(supabaseUrl, supabaseAnonKey);