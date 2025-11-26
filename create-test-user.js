import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ghwkbcjieqiziqvzidra.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_KEY_HERE';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createTestUser() {
    const { data, error } = await supabase.auth.admin.createUser({
        email: 'admin@santamerica.com',
        password: 'santadeck123',
        email_confirm: true
    });

    if (error) {
        console.error('Erro ao criar usuário:', error.message);
    } else {
        console.log('✅ Usuário criado com sucesso!');
        console.log('Email: admin@santamerica.com');
        console.log('Senha: santadeck123');
    }
}

createTestUser();
