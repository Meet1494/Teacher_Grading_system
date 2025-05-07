import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import GradingSheet from "@/pages/grading-sheet";
import ManageStudents from "@/pages/manage-students";
import Reports from "@/pages/reports";
import { ProtectedRoute } from "./lib/protected-route";

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Switch>
        <ProtectedRoute path="/" component={AuthPage} />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/grade/:subject/:experiment/:class" component={GradingSheet} />
        <ProtectedRoute path="/students" component={ManageStudents} />
        <ProtectedRoute path="/reports" component={Reports} />
        <Route path="/auth" component={AuthPage} />
        <Route component={NotFound} />
      </Switch>
    </TooltipProvider>
  );
}

export default App;
