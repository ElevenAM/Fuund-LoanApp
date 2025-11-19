import { useLocation } from "wouter";
import { Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ApplicationDashboard from "@/components/ApplicationDashboard";

export default function Dashboard() {
  const [, setLocation] = useLocation();

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
            <Button variant="outline" size="sm" data-testid="button-sign-out">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main>
        <ApplicationDashboard />
      </main>
    </div>
  );
}
