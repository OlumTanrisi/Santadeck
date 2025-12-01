/**
 * Configuração do Cliente Supabase
 * 
 * Inicializa a conexão com o backend Supabase usando as variáveis de ambiente
 * ou valores hardcoded (para desenvolvimento).
 */
import { createClient } from '@supabase/supabase-js';

// URL do projeto Supabase
const supabaseUrl = 'https://bucpbtjhbxbwukjugwmk.supabase.co';

// Chave anônima (pública) do Supabase
// Esta chave é segura para usar no frontend, pois as regras de segurança (RLS)
// no banco de dados controlam o acesso aos dados.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1Y3BidGpoYnhid3VranVnd21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDU0NDYsImV4cCI6MjA4MDE4MTQ0Nn0.aQjFThWctPDeQ8yE9IzBBya1w7SYT080SrSXbYBZs_g';

/**
 * Instância do cliente Supabase
 * Exportada para ser usada em toda a aplicação para fazer requisições ao banco,
 * autenticação, storage, etc.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
