import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Book, Camera, Signal, Database, Code, Home, FileText, Users, Settings, LogOut } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { navigate } from "wouter/use-browser-location";

type SubjectConfig = {
  name: string;
  icon: React.ReactNode;
  experiments: number[];
};

const subjects: SubjectConfig[] = [
  { name: "FSD", icon: <Book className="w-6 h-6" />, experiments: [1, 2, 3, 4, 5] },
  { name: "IPCV", icon: <Camera className="w-6 h-6" />, experiments: [1, 2, 3, 4, 5] },
  { name: "ISIG", icon: <Signal className="w-6 h-6" />, experiments: [1, 2, 3, 4, 5] },
  { name: "BDA", icon: <Database className="w-6 h-6" />, experiments: [1, 2, 3, 4, 5] },
  { name: "SE", icon: <Code className="w-6 h-6" />, experiments: [1, 2, 3, 4, 5] },
];

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [openSubjects, setOpenSubjects] = useState<string[]>([]);

  const toggleSubject = (subject: string) => {
    setOpenSubjects((prev) => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject) 
        : [...prev, subject]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    navigate("/");
  };

  const sidebarClasses = `fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-30 transition-transform md:relative
    ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`;

  return (
    <div className={sidebarClasses}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-primary">Teacher Grading System</h1>
        </div>
        
        {/* User info */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <Avatar className="h-10 w-10 bg-primary text-white">
            <AvatarFallback>{user?.name ? getInitials(user.name) : "NN"}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="font-medium text-sm">{user?.name || "User"}</p>
            <p className="text-xs text-gray-500">Teacher</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dashboard</h2>
          <Link href="/">
            <a className={`flex items-center px-2 py-2 mt-1 text-sm font-medium rounded-md ${
              location === "/" ? "bg-primary bg-opacity-10 border-l-[3px] border-primary" : "hover:bg-gray-100"
            }`}>
              <Home className="w-6 h-6 mr-2" />
              <span>Overview</span>
            </a>
          </Link>
          
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Subjects</h2>
          
          {subjects.map((subject) => (
            <Collapsible 
              key={subject.name}
              open={openSubjects.includes(subject.name)}
              onOpenChange={() => toggleSubject(subject.name)}
              className="space-y-1 mt-2"
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 focus:outline-none"
                >
                  <div className="flex items-center">
                    {subject.icon}
                    <span className="ml-2">{subject.name}</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <polyline points={openSubjects.includes(subject.name) ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}></polyline>
                  </svg>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-8 space-y-1">
                {subject.experiments.map((exp) => (
                  <Link key={`${subject.name}-${exp}`} href={`/grade/${subject.name}/${exp}/IT1`}>
                    <a className={`block px-2 py-1 text-sm ${
                      location === `/grade/${subject.name}/${exp}/IT1` ? "text-primary" : "text-gray-600 hover:text-primary"
                    }`}>
                      Experiment {exp}
                    </a>
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
          
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Reports</h2>
          <Link href="/reports">
            <a className={`flex items-center px-2 py-2 mt-1 text-sm font-medium rounded-md ${
              location === "/reports" ? "bg-primary bg-opacity-10 border-l-[3px] border-primary" : "hover:bg-gray-100"
            }`}>
              <FileText className="w-6 h-6 mr-2" />
              <span>Generate Reports</span>
            </a>
          </Link>
          
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Settings</h2>
          <Link href="/students">
            <a className={`flex items-center px-2 py-2 mt-1 text-sm font-medium rounded-md ${
              location === "/students" ? "bg-primary bg-opacity-10 border-l-[3px] border-primary" : "hover:bg-gray-100"
            }`}>
              <Users className="w-6 h-6 mr-2" />
              <span>Manage Students</span>
            </a>
          </Link>
          <Link href="/settings">
            <a className={`flex items-center px-2 py-2 mt-1 text-sm font-medium rounded-md ${
              location === "/settings" ? "bg-primary bg-opacity-10 border-l-[3px] border-primary" : "hover:bg-gray-100"
            }`}>
              <Settings className="w-6 h-6 mr-2" />
              <span>Account Settings</span>
            </a>
          </Link>
        </nav>
        
        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <Button 
            variant="ghost" 
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 rounded-md hover:bg-red-50"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-5 h-5 mr-2" />
            <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
