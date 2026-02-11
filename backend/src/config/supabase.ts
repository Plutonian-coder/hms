import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './index';

// Admin client — uses service role key. Bypasses RLS. For server-side operations only.
export const supabaseAdmin: SupabaseClient = createClient(
    config.supabase.url,
    config.supabase.serviceRoleKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

// Creates a per-request client scoped to the user's JWT
export function createUserClient(accessToken: string): SupabaseClient {
    return createClient(config.supabase.url, config.supabase.anonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
