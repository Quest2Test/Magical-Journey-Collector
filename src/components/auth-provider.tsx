import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

const supabasePromise = import("@/lib/supabase").then((mod) => mod.supabase as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let canceled = false;
    let subscription: { unsubscribe: () => void } | null = null;

    supabasePromise.then((supabase) => {
      if (canceled) return;

      supabase.auth.getSession().then(({ data: { session } }: any) => {
        if (!canceled) {
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);
        }
      });

      subscription = supabase.auth.onAuthStateChange((_event: any, session: Session) => {
        if (!canceled) {
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);
        }
      }).data.subscription;
    });

    return () => {
      canceled = true;
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = await supabasePromise;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
