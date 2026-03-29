import { environment } from '../../../environments/environment';

/**
 * Use the same hostname as the Angular app (localhost vs 127.0.0.1) so:
 * - Requests hit a reachable gateway
 * - `Origin` matches an entry in gateway CORS (localhost ≠ 127.0.0.1 for browsers)
 */
export function resolveGatewayBase(): string {
  if (typeof window === 'undefined' || !window.location?.hostname) {
    return environment.gatewayUrl.replace(/\/+$/, '');
  }
  const proto = window.location.protocol === 'https:' ? 'https' : 'http';
  return `${proto}://${window.location.hostname}:3000`;
}

export function resolveApiBase(): string {
  return `${resolveGatewayBase()}/api/v1`;
}
