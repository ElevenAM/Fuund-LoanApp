import { useEffect } from "react";
import { useLocation } from "wouter";
import { Building2, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import ApplicationDashboard from "@/components/ApplicationDashboard";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/api/auth/login?redirect=/dashboard";
    }
  }, [authLoading, isAuthenticated]);
  
  // Load user's applications
  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/applications"],
    enabled: isAuthenticated,
  });
  
  const handleSignOut = () => {
    window.location.href = "/api/auth/logout";
  };
  
  if (authLoading || applicationsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                data-testid="button-back-home"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Home
              </Button>
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" />
                <h1 className="text-lg font-semibold">Commercial Loans</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setLocation("/apply")}
                data-testid="button-new-application"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Application
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                data-testid="button-sign-out"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <ApplicationDashboard applications={applications || []} />
      </main>
    </div>
  );
}
