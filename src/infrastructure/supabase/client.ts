/**
 * Qarayti.ai — Supabase Client Singleton
 * Target Project: aeubxjknpmsrsopcatyd
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const metaEnv = ((import.meta as unknown) as { env?: Record<string, string> }).env || {};

const rawSupabaseUrl = (
  metaEnv.VITE_SUPABASE_URL ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  ''
).trim();

const rawAnonKey = (
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  ''
).trim();

const isValidSupabaseConfig = Boolean(
  rawSupabaseUrl &&
  rawAnonKey &&
  !rawSupabaseUrl.includes('placeholder') &&
  !rawSupabaseUrl.includes('your-project') &&
  !rawAnonKey.includes('placeholder') &&
  rawAnonKey !== 'your-anon-key'
);

let formattedUrl = rawSupabaseUrl;
if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
  formattedUrl = `https://${formattedUrl}`;
}

if (!isValidSupabaseConfig) {
  console.error('[QARAYTI_SUPABASE_CONFIG_ERROR] Missing or invalid Supabase configuration.', {
    targetProjectId: 'aeubxjknpmsrsopcatyd',
    hasUrl: Boolean(rawSupabaseUrl),
    hasKey: Boolean(rawAnonKey),
  });
}

const clientUrl = isValidSupabaseConfig ? formattedUrl : 'https://unconfigured.supabase.co';
const clientKey = isValidSupabaseConfig ? rawAnonKey : 'unconfigured-anon-key';

const parsedHost = isValidSupabaseConfig ? new URL(clientUrl).host : 'UNCONFIGURED';

console.log('[SUPABASE_CONFIG_CHECK]', {
  targetProjectId: 'aeubxjknpmsrsopcatyd',
  isConfigured: isValidSupabaseConfig,
  urlHost: parsedHost,
  matchesTargetProject: parsedHost.includes('aeubxjknpmsrsopcatyd'),
});

export const supabase: SupabaseClient = createClient(clientUrl, clientKey);

