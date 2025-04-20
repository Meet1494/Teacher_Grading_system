import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { subjectsEnum } from "@shared/schema";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, Book, Camera, Signal, Database, Code, Users, FileText } from "lucide-react";

// Subject icons mapping
const subjectIcons = {
  FSD: <Book className="w-6 h-6" />,
  IPCV: <Camera className="w-6 h-6" />,
  ISIG: <Signal className="w-6 h-6" />,
  BDA: <Database className="w-6 h-6" />,
  SE: <Code className="w-6 h-6" />,
};

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Fetch students count by class
  const { data: studentsData, isLoading: loadingStudents } = useQuery({
    queryKey: ['/api/students'],
    staleTime: 60000,
  });
  
  // Get classes distribution
  const classDistribution = {
    IT1: studentsData?.filter(s => s.class === "IT1").length || 0,
    IT2: studentsData?.filter(s => s.class === "IT2").length || 0,
    IT3: studentsData?.filter(s => s.class === "IT3").length || 0,
  };
  
  const classChartData = [
    { name: 'IT1', students: classDistribution.IT1 },
    { name: 'IT2', students: classDistribution.IT2 },
    { name: 'IT3', students: classDistribution.IT3 },
  ];
  
  // Create list of all subjects and their experiments
  const subjects = subjectsEnum.options;
  const subjectExperiments = subjects.map(subject => ({
    name: subject,
    experiments: [1, 2, 3, 4, 5],
    icon: subjectIcons[subject as keyof typeof subjectIcons]
  }));

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-20">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-gray-500 focus:outline-none mr-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to the Teacher Grading System</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and grade your students across various subjects and experiments
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStudents ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  <div className="text-2xl font-bold">{studentsData?.length || 0}</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subjects.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Experiments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subjects.length * 5}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Actions and Class Distribution */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks to get you started</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <Link href="/students">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-5 w-5" />
                    Manage Students
                  </Button>
                </Link>
                <Link href="/grade/FSD/1/IT1">
                  <Button variant="outline" className="w-full justify-start">
                    <Book className="mr-2 h-5 w-5" />
                    Grade FSD Exp 1
                  </Button>
                </Link>
                <Link href="/grade/IPCV/1/IT1">
                  <Button variant="outline" className="w-full justify-start">
                    <Camera className="mr-2 h-5 w-5" />
                    Grade IPCV Exp 1
                  </Button>
                </Link>
                <Link href="/reports">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-5 w-5" />
                    Generate Reports
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Students by Class</CardTitle>
                <CardDescription>Distribution of students across classes</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {loadingStudents ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="students" fill="hsl(var(--chart-1))" name="Students" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Subjects and Experiments */}
          <Card>
            <CardHeader>
              <CardTitle>Subjects & Experiments</CardTitle>
              <CardDescription>Grading sheets for each subject and experiment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {subjectExperiments.map(subject => (
                  <Card key={subject.name} className="overflow-hidden">
                    <CardHeader className="pb-2 bg-primary/5">
                      <div className="flex items-center">
                        {subject.icon}
                        <CardTitle className="ml-2">{subject.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ul className="divide-y divide-gray-100">
                        {subject.experiments.map(exp => (
                          <li key={`${subject.name}-${exp}`}>
                            <Link href={`/grade/${subject.name}/${exp}/IT1`}>
                              <a className="block px-4 py-2 hover:bg-gray-50">
                                Experiment {exp}
                              </a>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
