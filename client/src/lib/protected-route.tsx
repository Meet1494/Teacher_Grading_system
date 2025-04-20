import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType<any>;
};

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  // Access auth context
  const { user, isLoading } = useAuth();

  // Create a wrapper component
  const AuthenticatedComponent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading...</span>
        </div>
      );
    }

    if (!user) {
      return <Redirect to="/auth" />;
    }

    return <Component />;
  };

  // Return the Route with the wrapped component
  return <Route path={path} component={AuthenticatedComponent} />;
}
