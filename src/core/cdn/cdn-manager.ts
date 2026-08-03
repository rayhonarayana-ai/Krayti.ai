/**
 * Qarayti.ai — Edge CDN & Asset Optimization Manager (1M Active Users Scale)
 * Configures HTTP Cache-Control headers, edge origin routing, asset preloading,
 * and media format negotiation for ultra-fast asset delivery.
 */

import { logger } from '../logging/logger';

export interface CdnCachePolicy {
  maxAgeSeconds: number;
  sMaxAgeSeconds: number; // Edge CDN shared cache
  staleWhileRevalidateSeconds: number;
  isPublic: boolean;
  immutable?: boolean;
}

export class CdnManager {
  private edgeOrigins = [
    'https://cdn-primary.qarayti.ai',
    'https://cdn-eu-west.qarayti.ai',
    'https://cdn-africa-north.qarayti.ai',
  ];

  public getCacheControlHeader(type: 'STATIC_ASSET' | 'IMMUTABLE_MEDIA' | 'DYNAMIC_API' | 'PRIVATE_DATA'): string {
    let policy: CdnCachePolicy;

    switch (type) {
      case 'IMMUTABLE_MEDIA':
        policy = {
          maxAgeSeconds: 31536000, // 1 year
          sMaxAgeSeconds: 31536000,
          staleWhileRevalidateSeconds: 86400,
          isPublic: true,
          immutable: true,
        };
        break;
      case 'STATIC_ASSET':
        policy = {
          maxAgeSeconds: 86400, // 24 hours
          sMaxAgeSeconds: 604800, // 7 days
          staleWhileRevalidateSeconds: 86400,
          isPublic: true,
        };
        break;
      case 'DYNAMIC_API':
        policy = {
          maxAgeSeconds: 0,
          sMaxAgeSeconds: 60, // 1 min CDN cache
          staleWhileRevalidateSeconds: 300,
          isPublic: true,
        };
        break;
      case 'PRIVATE_DATA':
      default:
        return 'private, no-cache, no-store, must-revalidate';
    }

    const visibility = policy.isPublic ? 'public' : 'private';
    const immutableFlag = policy.immutable ? ', immutable' : '';
    return `${visibility}, max-age=${policy.maxAgeSeconds}, s-maxage=${policy.sMaxAgeSeconds}, stale-while-revalidate=${policy.staleWhileRevalidateSeconds}${immutableFlag}`;
  }

  public getOptimalCdnUrl(assetPath: string): string {
    // Hash routing to pick deterministic CDN origin edge
    let hash = 0;
    for (let i = 0; i < assetPath.length; i++) {
      hash = (hash << 5) - hash + assetPath.charCodeAt(i);
      hash |= 0;
    }
    const originIndex = Math.abs(hash) % this.edgeOrigins.length;
    const origin = this.edgeOrigins[originIndex];
    const cleanPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;

    return `${origin}${cleanPath}`;
  }

  public preloadCriticalAsset(url: string, type: 'script' | 'style' | 'font' | 'fetch'): void {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    if (type === 'font') link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    logger.debug('CdnManager', `Preloaded critical asset: ${url} (${type})`);
  }
}

export const cdnManager = new CdnManager();
