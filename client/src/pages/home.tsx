import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, FileText, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();
  
  const handleSignIn = () => {
    window.location.href = "/api/login";
  };
  
  const handleStartApplication = () => {
    if (isAuthenticated) {
      setLocation("/apply");
    } else {
      window.location.href = "/api/login?redirect=/apply";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-8 h-8 text-primary" data-testid="icon-logo" />
              <h1 className="text-xl font-semibold" data-testid="text-app-name">
                Commercial Loans
              </h1>
            </div>
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/dashboard")}
                data-testid="button-dashboard"
              >
                Dashboard
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignIn}
                data-testid="button-sign-in"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold mb-4" data-testid="text-hero-heading">
            Commercial Real Estate Financing Made Simple
          </h2>
          <p className="text-xl text-muted-foreground mb-8" data-testid="text-hero-subheading">
            Get your term sheet in 7-10 minutes. Professional, fast, transparent.
          </p>
          <Button
            size="lg"
            className="h-12 px-8"
            onClick={handleStartApplication}
            data-testid="button-start-application"
          >
            Start Your Application
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Quick Application</h3>
            <p className="text-sm text-muted-foreground">
              Complete your initial submission in under 10 minutes with our streamlined process
            </p>
          </Card>

          <Card className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Auto-Calculated Metrics</h3>
            <p className="text-sm text-muted-foreground">
              See your LTV, DSCR, and other key metrics calculated in real-time
            </p>
          </Card>

          <Card className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">All Loan Types</h3>
            <p className="text-sm text-muted-foreground">
              Permanent, bridge, and construction loans for all commercial property types
            </p>
          </Card>
        </div>

        <Card className="p-8 bg-accent">
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-2">Already started an application?</h3>
            <p className="text-muted-foreground mb-6">
              Sign in to continue where you left off
            </p>
            <div className="flex gap-4 justify-center">
              {!isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={handleSignIn}
                  data-testid="button-sign-in-bottom"
                >
                  Sign In
                </Button>
              )}
              <Button
                onClick={() => setLocation("/dashboard")}
                data-testid="button-view-dashboard"
              >
                View Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
