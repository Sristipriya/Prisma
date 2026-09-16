import { createClient, User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'employer' | 'employee';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Cryptographically validates the user's JWT session with the Supabase Auth server.
 * Unlike getSession(), getUser() cannot be spoofed by modifying browser localStorage.
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return null;
    }
    return user;
  } catch (err) {
    console.warn('[Security] Session cryptographic validation failed:', err);
    return null;
  }
}

/**
 * Fetches the user's profile and RBAC role.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, full_name')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return data as UserProfile;
  } catch (err) {
    console.warn('[Security] Failed to fetch user profile:', err);
    return null;
  }
}

/**
 * Role-Based Access Control (RBAC) Route Definitions
 */
export const EMPLOYER_ROUTES = [
  '/payroll',
  '/vendor',
  '/vaultguard',
  '/analytics',
  '/circuit-demo',
];

export const EMPLOYEE_ROUTES = [
  '/worker',
];

export const SHARED_ROUTES = [
  '/streamcredit',
  '/flowsplit',
  '/auditpass',
];

/**
 * Enforces RBAC permissions based on authenticated user role.
 */
export function isRouteAuthorized(
  role: UserRole | null | undefined,
  pathname: string
): { authorized: boolean; redirectPath?: string } {
  // Normalize pathname: strip trailing slash, keep root /
  const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');

  if (role === 'employee') {
    // Employees cannot access employer-only modules (payroll streams, vendor settlements, vault guard, analytics)
    const isEmployerRoute = EMPLOYER_ROUTES.some(
      route => cleanPath === route || cleanPath.startsWith(`${route}/`)
    );
    if (isEmployerRoute) {
      return { authorized: false, redirectPath: '/worker' };
    }
  } else if (role === 'employer') {
    // Employers cannot access employee-only claim portal
    const isEmployeeRoute = EMPLOYEE_ROUTES.some(
      route => cleanPath === route || cleanPath.startsWith(`${route}/`)
    );
    if (isEmployeeRoute) {
      return { authorized: false, redirectPath: '/payroll' };
    }
  }

  return { authorized: true };
}

/**
 * Sanitizes redirect target URLs to prevent Open Redirect attacks.
 * Only allows relative paths starting with a single '/' and rejects protocols or double slashes.
 */
export function sanitizeRedirectPath(
  rawPath: string | null | undefined,
  fallback: string = '/payroll'
): string {
  if (!rawPath || typeof rawPath !== 'string') return fallback;

  const trimmed = rawPath.trim();

  // Reject URLs with protocols (e.g. https://, http://, javascript:)
  if (trimmed.includes('://') || trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) {
    return fallback;
  }

  // Reject protocol-relative URLs (e.g. //evil.com)
  if (trimmed.startsWith('//')) {
    return fallback;
  }

  // Must strictly start with a single forward slash
  if (!trimmed.startsWith('/')) {
    return fallback;
  }

  return trimmed;
}
