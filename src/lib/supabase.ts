/**
 * Configuração do Cliente Supabase
 * 
 * Inicializa a conexão com o backend Supabase usando as variáveis de ambiente
 * ou valores hardcoded (para desenvolvimento).
 */
import { createClient } from '@supabase/supabase-js';

// URL do projeto Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Chave anônima (pública) do Supabase
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Instância do cliente Supabase
 * Exportada para ser usada em toda a aplicação para fazer requisições ao banco,
 * autenticação, storage, etc.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
