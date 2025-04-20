import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside className={cn("hidden md:flex flex-col w-64 bg-primary text-white shadow-lg", className)}>
      <div className="flex items-center justify-center h-16 border-b border-primary-foreground/30">
        <h1 className="text-xl font-medium">Grading System</h1>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="py-4">
          <li>
            <Link href="/">
              <a className={cn(
                "flex items-center px-6 py-3 text-white hover:bg-primary-foreground/10",
                isActive("/") && "bg-primary-foreground/20"
              )}>
                <span className="material-icons mr-3">dashboard</span>
                Dashboard
              </a>
            </Link>
          </li>
          <li>
            <Link href="/experiments">
              <a className={cn(
                "flex items-center px-6 py-3 text-white hover:bg-primary-foreground/10",
                isActive("/experiments") && "bg-primary-foreground/20"
              )}>
                <span className="material-icons mr-3">science</span>
                Experiments
              </a>
            </Link>
          </li>
          <li>
            <Link href="/students">
              <a className={cn(
                "flex items-center px-6 py-3 text-white hover:bg-primary-foreground/10",
                isActive("/students") && "bg-primary-foreground/20"
              )}>
                <span className="material-icons mr-3">people</span>
                Students
              </a>
            </Link>
          </li>
          <li>
            <Link href="/reports">
              <a className={cn(
                "flex items-center px-6 py-3 text-white hover:bg-primary-foreground/10",
                isActive("/reports") && "bg-primary-foreground/20"
              )}>
                <span className="material-icons mr-3">assessment</span>
                Reports
              </a>
            </Link>
          </li>
          <li>
            <Link href="/settings">
              <a className={cn(
                "flex items-center px-6 py-3 text-white hover:bg-primary-foreground/10",
                isActive("/settings") && "bg-primary-foreground/20"
              )}>
                <span className="material-icons mr-3">settings</span>
                Settings
              </a>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-primary-foreground/30">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center mr-2">
            <span className="material-icons text-sm">person</span>
          </div>
          <div>
            <p className="text-sm font-medium">{user?.name || 'Teacher'}</p>
            <p className="text-xs text-primary-foreground/70">{user?.department || 'Department'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="ml-auto text-primary-foreground/70 hover:text-white"
            disabled={logoutMutation.isPending}
          >
            <span className="material-icons">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
