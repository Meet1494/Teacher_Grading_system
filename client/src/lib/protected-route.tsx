import { Route } from "wouter";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType<any>;
};

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  // Since we've removed authentication, we'll directly render the component
  // without any auth checks
  console.log("Rendering component for path:", path);
  return <Route path={path} component={Component} />;
}
