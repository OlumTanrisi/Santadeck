import { supabase } from './supabase';

/**
 * Utilitário para registrar atividades do usuário no banco de dados.
 */
export const logActivity = async (
    userId: string,
    action: string,
    appId: string | null = null,
    appName: string | null = null,
    details: any = {}
) => {
    try {
        const { error } = await supabase.from('activity_logs').insert({
            user_id: userId,
            action,
            app_id: appId,
            app_name: appName,
            details: {
                ...details,
                timestamp: new Date().toISOString(),
            },
        });

        if (error) {
            console.error('Error logging activity:', error);
        }
    } catch (err) {
        console.error('Failed to log activity:', err);
    }
};
