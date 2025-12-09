/**
 * Configuração do Cliente Supabase
 * 
 * Inicializa a conexão com o backend Supabase usando as variáveis de ambiente
 * ou valores hardcoded (para desenvolvimento).
 */
import { createClient } from '@supabase/supabase-js';

// URL do projeto Supabase
const supabaseUrl = 'https://mlisanvuyijiniskofoq.supabase.co';

// Chave anônima (pública) do Supabase
// Esta chave é segura para usar no frontend, pois as regras de segurança (RLS)
// no banco de dados controlam o acesso aos dados.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1saXNhbnZ1eWlqaW5pc2tvZm9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NjI3NjAsImV4cCI6MjA4MDMzODc2MH0.vCiIrtKAKBMqCwtfqObgq5w9dwndzQ_jE2e-D1l2RCE';

/**
 * Instância do cliente Supabase
 * Exportada para ser usada em toda a aplicação para fazer requisições ao banco,
 * autenticação, storage, etc.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
