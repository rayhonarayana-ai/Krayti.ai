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

    const env = (import.meta as unknown as { env: Record<string, string> }).env || {};

    const rawSupabaseUrl = (env.VITE_SUPABASE_URL || '').trim();
    const rawSupabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || '').trim();
    const geminiKey = env.GEMINI_API_KEY || '';

    const sanitizeUrl = (urlStr: string): string => {
      if (!urlStr) return 'https://placeholder-project.supabase.co';
      try {
        const parsed = new URL(urlStr);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          return urlStr;
        }
      } catch {
        // Retry adding https:// if missing protocol
        try {
          const withHttps = `https://${urlStr}`;
          const parsed = new URL(withHttps);
          if (parsed.protocol === 'https:') {
            return withHttps;
          }
        } catch {
          // invalid URL
        }
      }
      return 'https://placeholder-project.supabase.co';
    };

    const supabaseUrl = sanitizeUrl(rawSupabaseUrl);
    const supabaseAnonKey = rawSupabaseAnonKey || 'placeholder-anon-key';

    const isSupabaseConfigured = Boolean(
      rawSupabaseUrl &&
      rawSupabaseAnonKey &&
      !supabaseUrl.includes('placeholder') &&
      !supabaseUrl.includes('your-project') &&
      rawSupabaseAnonKey !== 'your-anon-key'
    );

    this.config = {
      appName: 'Qarayti.ai',
      appVersion: '1.0.0-foundation',
      environment: (env.VITE_APP_ENV as AppConfig['environment']) || 'production',
      logLevel: (env.VITE_LOG_LEVEL as AppConfig['logLevel']) || 'debug',
      enableDiagnostics: env.VITE_ENABLE_DIAGNOSTICS !== 'false',

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
        jwtSecret: env.VITE_JWT_SECRET || 'qarayti-production-jwt-foundation-secret-key',
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
