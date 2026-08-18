/**
 * Qarayti.ai — Environment Configuration System
 * Centralized, validated environment configuration provider
 */

export interface AppConfig {
  appName: string;
  appVersion: string;
  environment: 'development' | 'staging' | 'production';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableDiagnostics: boolean;
  
  supabase: {
    url: string;
    anonKey: string;
    isConfigured: boolean;
  };
  
  gemini: {
    apiKey: string;
    isConfigured: boolean;
  };
  
  auth: {
    jwtSecret: string;
    tokenExpirySeconds: number;
    refreshTokenExpiryDays: number;
  };

  countryPack: {
    code: 'MA'; // Morocco
    defaultLanguage: 'ar' | 'fr' | 'ary';
    currency: 'MAD';
    timeZone: 'Africa/Casablanca';
  };
}

class ConfigManager {
  private config!: AppConfig;
  private isLoaded = false;

  public load(): AppConfig {
    if (this.isLoaded) return this.config;

    const importMetaEnv = (import.meta as unknown as { env: Record<string, string> })?.env || {};

    const rawSupabaseUrl = (
      (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
      importMetaEnv.VITE_SUPABASE_URL ||
      ''
    ).trim();

    const rawSupabaseAnonKey = (
      (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
      importMetaEnv.VITE_SUPABASE_ANON_KEY ||
      ''
    ).trim();

    const geminiKey = (
      (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
      importMetaEnv.GEMINI_API_KEY ||
      ''
    ).trim();

    const sanitizeUrl = (urlStr: string): string => {
      if (!urlStr || urlStr.includes('placeholder') || urlStr.includes('your-project')) return '';
      try {
        const parsed = new URL(urlStr.startsWith('http://') || urlStr.startsWith('https://') ? urlStr : `https://${urlStr}`);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          return parsed.href;
        }
      } catch {
        // invalid URL
      }
      return '';
    };

    const supabaseUrl = sanitizeUrl(rawSupabaseUrl);
    const supabaseAnonKey = (rawSupabaseAnonKey && !rawSupabaseAnonKey.includes('placeholder') && rawSupabaseAnonKey !== 'your-anon-key') ? rawSupabaseAnonKey : '';

    const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

    const appEnv = (typeof process !== 'undefined' && process.env?.VITE_APP_ENV) || importMetaEnv.VITE_APP_ENV || 'production';
    const logLevel = (typeof process !== 'undefined' && process.env?.VITE_LOG_LEVEL) || importMetaEnv.VITE_LOG_LEVEL || 'debug';
    const enableDiagnostics = (typeof process !== 'undefined' && process.env?.VITE_ENABLE_DIAGNOSTICS) || importMetaEnv.VITE_ENABLE_DIAGNOSTICS || 'true';
    const jwtSecret = (typeof process !== 'undefined' && process.env?.VITE_JWT_SECRET) || importMetaEnv.VITE_JWT_SECRET || '';

    this.config = {
      appName: 'Qarayti.ai',
      appVersion: '1.0.0-foundation',
      environment: appEnv as AppConfig['environment'],
      logLevel: logLevel as AppConfig['logLevel'],
      enableDiagnostics: enableDiagnostics !== 'false',

      supabase: {
        url: supabaseUrl,
        anonKey: supabaseAnonKey,
        isConfigured: isSupabaseConfigured,
      },

      gemini: {
        apiKey: geminiKey,
        isConfigured: Boolean(geminiKey && geminiKey !== 'MY_GEMINI_API_KEY'),
      },

      auth: {
        jwtSecret: jwtSecret,
        tokenExpirySeconds: 3600, // 1 hour
        refreshTokenExpiryDays: 30,
      },

      countryPack: {
        code: 'MA',
        defaultLanguage: 'ar',
        currency: 'MAD',
        timeZone: 'Africa/Casablanca',
      },
    };

    this.isLoaded = true;
    return this.config;
  }

  public get(): AppConfig {
    if (!this.isLoaded) {
      return this.load();
    }
    return this.config;
  }
}

export const envConfig = new ConfigManager();
