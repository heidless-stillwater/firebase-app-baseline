'use client';

import { useFirebase } from '@/firebase/provider';
import type { User } from 'firebase/auth';

export interface UseUser {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

/**
 * Hook to get the current user's authentication state.
 *
 * This hook provides a convenient way to access the authenticated user's
 * information throughout the application. It returns the user object if a user
 * is signed in, null if not, and provides loading and error states.
 *
 * @returns {UseUser} An object containing the user, loading state, and error.
 *
 * @example
 * const { user, isUserLoading, userError } = useUser();
 *
 * if (isUserLoading) {
 *   return <p>Loading...</p>;
 * }
 *
 * if (userError) {
 *   return <p>Error: {userError.message}</p>;
 * }
 *
 * if (user) {
 *   return <p>Welcome, {user.displayName}!</p>;
 * } else {
 *   return <p>Please sign in.</p>;
 * }
 */
export function useUser(): UseUser {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
}
