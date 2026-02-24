import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wcrkhvfgjmvuadxjeogu.supabase.co';
const supabaseAnonKey = 'sb_publishable_NnA39_gtTdy6i-VEvLlsUQ_IwDN8vRI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);