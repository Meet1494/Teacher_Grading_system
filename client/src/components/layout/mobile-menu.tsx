import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface MobileMenuProps {
  className?: string;
}

export function MobileMenu({ className }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-primary text-white z-10 shadow-md">
        <div className="flex items-center justify-between h-16 px-4">
          <button onClick={() => setIsOpen(true)} className="p-1">
            <span className="material-icons">menu</span>
          </button>
          <h1 className="text-xl font-medium">Grading System</h1>
          <button className="p-1">
            <span className="material-icons">account_circle</span>
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      >
        {/* Mobile menu */}
        <div 
          className={cn(
            "w-64 h-full bg-primary text-white shadow-lg transform transition-transform",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between h-16 border-b border-primary-foreground/30 px-4">
            <h1 className="text-xl font-medium">Menu</h1>
            <button onClick={() => setIsOpen(false)}>
              <span className="material-icons">close</span>
            </button>
          </div>

          <nav>
            <ul className="py-4">
              <li>
                <Link href="/">
                  <a 
                    className={cn(
                      "flex items-center px-6 py-3 text-white hover:bg-primary-foreground/10",
                      isActive("/") && "bg-primary-foreground/20"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="material-icons mr-3">dashboard</span>
                    Dashboard
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/experiments">
                  <a 
                    className={cn(
                      "flex items-center px-6 py-3 text-white hover:bg-primary-foreground/10",
                      isActive("/experiments") && "bg-primary-foreground/20"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="material-icons mr-3">science</span>
                    Experiments
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/students">
                  <a 
                    className={cn(
                      "flex items-center px-6 py-3 text-white hover:bg-primary-foreground/10",
                      isActive("/students") && "bg-primary-foreground/20"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="material-icons mr-3">people</span>
                    Students
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/reports">
                  <a 
                    className={cn(
                      "flex items-center px-6 py-3 text-white hover:bg-primary-foreground/10",
                      isActive("/reports") && "bg-primary-foreground/20"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="material-icons mr-3">assessment</span>
                    Reports
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/settings">
                  <a 
                    className={cn(
                      "flex items-center px-6 py-3 text-white hover:bg-primary-foreground/10",
                      isActive("/settings") && "bg-primary-foreground/20"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="material-icons mr-3">settings</span>
                    Settings
                  </a>
                </Link>
              </li>
            </ul>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-foreground/30">
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
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden flex items-center justify-around h-16 bg-white border-t border-neutral-200 fixed bottom-0 left-0 right-0 z-10">
        <Link href="/">
          <a className="flex flex-col items-center">
            <span className={cn(
              "material-icons",
              isActive("/") ? "text-primary" : "text-neutral-500"
            )}>dashboard</span>
            <span className="text-xs mt-1">Dashboard</span>
          </a>
        </Link>
        <Link href="/experiments">
          <a className="flex flex-col items-center">
            <span className={cn(
              "material-icons",
              isActive("/experiments") ? "text-primary" : "text-neutral-500"
            )}>science</span>
            <span className="text-xs mt-1">Experiments</span>
          </a>
        </Link>
        <Link href="/students">
          <a className="flex flex-col items-center">
            <span className={cn(
              "material-icons",
              isActive("/students") ? "text-primary" : "text-neutral-500"
            )}>people</span>
            <span className="text-xs mt-1">Students</span>
          </a>
        </Link>
        <Link href="/reports">
          <a className="flex flex-col items-center">
            <span className={cn(
              "material-icons", 
              isActive("/reports") ? "text-primary" : "text-neutral-500"
            )}>assessment</span>
            <span className="text-xs mt-1">Reports</span>
          </a>
        </Link>
      </nav>
    </>
  );
}
