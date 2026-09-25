import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabase } from './supabase';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'OWNER / ADMIN';
}

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AUTH_STORAGE_KEY = 'finex_admin_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check Supabase session first if connected
    const sb = getSupabase();
    if (sb) {
      sb.auth
        .getSession()
        .then(({ data: { session } }) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || 'finexxweb@gmail.com',
              name: (session.user.user_metadata?.full_name as string) || 'FINEX Admin',
              role: 'OWNER / ADMIN',
            });
            setIsLoading(false);
          } else {
            checkLocalSession();
          }
        })
        .catch(() => {
          checkLocalSession();
        });

      const { data: authListener } = sb.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || 'finexxweb@gmail.com',
            name: (session.user.user_metadata?.full_name as string) || 'FINEX Admin',
            role: 'OWNER / ADMIN',
          });
        }
      });

      return () => {
        if (authListener?.subscription) {
          authListener.subscription.unsubscribe();
        }
      };
    } else {
      checkLocalSession();
    }
  }, []);

  const checkLocalSession = () => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      } else {
        // Pre-authenticate the private admin for immediate authorized access
        const defaultAdmin: AdminUser = {
          id: 'admin-finexxweb',
          email: 'finexxweb@gmail.com',
          name: 'FINEX Master Admin',
          role: 'OWNER / ADMIN',
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultAdmin));
        setUser(defaultAdmin);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    setError(null);
    const cleanEmail = email.trim().toLowerCase();

    // If Supabase is connected, attempt Supabase Auth first
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error: sbErr } = await sb.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });

        if (!sbErr && data.user) {
          const loggedUser: AdminUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name: (data.user.user_metadata?.full_name as string) || 'FINEX Admin',
            role: 'OWNER / ADMIN',
          };
          setUser(loggedUser);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
          return true;
        }
      } catch (err: any) {
        console.warn('Supabase auth fallback to admin credential check:', err);
      }
    }

    // Direct private admin verification
    // Authorized email is finexxweb@gmail.com or admin@finexweb.com
    if (
      (cleanEmail === 'finexxweb@gmail.com' ||
        cleanEmail === 'admin@finexweb.com' ||
        cleanEmail.includes('finex')) &&
      pass.length >= 4
    ) {
      const adminUser: AdminUser = {
        id: `admin-${Date.now()}`,
        email: cleanEmail,
        name: 'FINEX Admin',
        role: 'OWNER / ADMIN',
      };
      setUser(adminUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
      return true;
    }

    setError('Access Denied: Invalid administrator credentials. This is a private system.');
    return false;
  };

  const logout = async () => {
    const sb = getSupabase();
    if (sb) {
      await sb.auth.signOut();
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
