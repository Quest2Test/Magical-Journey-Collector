import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const { session, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If auth is no longer loading, redirect the user
    if (!isLoading) {
      if (session) {
        // Successfully logged in
        setLocation("/");
      } else {
        // Something went wrong or no session found
        setLocation("/login");
      }
    }
  }, [session, isLoading, setLocation]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <div className="text-center">
        <h2 className="text-xl font-semibold">Completing sign in...</h2>
        <p className="text-muted-foreground">You'll be redirected in just a moment.</p>
      </div>
    </div>
  );
}
