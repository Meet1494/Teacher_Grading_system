import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Download, FileText, Search } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { subjectsEnum } from "@shared/schema";

// Chart colors
const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function Reports() {
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");

  // Fetch all students
  const { data: allStudents, isLoading: loadingStudents } = useQuery<any[]>({
    queryKey: ['/api/students'],
  });

  // Filter students by search and class
  const filteredStudents = allStudents && Array.isArray(allStudents)
    ? allStudents.filter(
        (student: any) =>
          (selectedClass === "all" || student.class === selectedClass) &&
          (student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.sapId.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  // Fetch all student reports data
  const {
    data: allReports,
    isLoading: loadingAllReports,
    isError: allReportsError,
  } = useQuery<any[]>({
    queryKey: ['/api/reports/student'],
  });
  
  // Get the selected student report from the all reports data
  const studentReport = selectedStudent && allReports
    ? allReports.find(report => report.student.id === selectedStudent)
    : null;

  // Calculate averages by subject
  const subjectAverages = studentReport?.grades
    ? Object.values(subjectsEnum.enum).map((subject) => {
        const subjectGrades = studentReport.grades.filter(
          (grade: any) => grade.subject === subject
        );
        
        if (subjectGrades.length === 0) return { subject, average: 0 };
        
        const totalScore = subjectGrades.reduce((acc: number, grade: any) => acc + grade.total, 0);
        return {
          subject, 
          average: totalScore / subjectGrades.length
        };
      })
    : [];

  // Generate data for parameter breakdown
  const parameterBreakdown = studentReport?.grades
    ? ["performance", "knowledge", "implementation", "strategy", "attitude"].map(param => {
        const totalScore = studentReport.grades.reduce(
          (acc: number, grade: any) => acc + grade[param as keyof typeof grade] as number, 
          0
        );
        return {
          name: param.charAt(0).toUpperCase() + param.slice(1),
          value: studentReport.grades.length > 0 
            ? (totalScore / studentReport.grades.length) 
            : 0
        };
      })
    : [];

  const handleExportReport = () => {
    if (!studentReport) return;

    try {
      // Create CSV content
      let csvContent = 
        "Subject,Experiment,Performance,Knowledge,Implementation,Strategy,Attitude,Total,Comment\n";
      
      studentReport.grades.forEach(grade => {
        const comment = grade.comment ? `"${grade.comment.replace(/"/g, '""')}"` : "";
        
        csvContent += `${grade.subject},${grade.experimentNumber},${grade.performance},${grade.knowledge},${grade.implementation},${grade.strategy},${grade.attitude},${grade.total},${comment}\n`;
      });
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${studentReport.student.name}_Report.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: "The student report has been exported to CSV",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export the report. Please try again.",
        variant: "destructive",
      });
    }
  };

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
              <h2 className="text-xl font-semibold text-gray-800">Generate Reports</h2>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Student Selection */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Select Student</CardTitle>
                <CardDescription>Choose a student to view their report</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name or SAP ID..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select
                      value={selectedClass}
                      onValueChange={setSelectedClass}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        <SelectItem value="IT1">IT1</SelectItem>
                        <SelectItem value="IT2">IT2</SelectItem>
                        <SelectItem value="IT3">IT3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Student List */}
                  {loadingStudents ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="border rounded-md overflow-hidden max-h-[500px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Class</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={2} className="text-center text-gray-500 py-4">
                                No students found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredStudents.map((student) => (
                              <TableRow
                                key={student.id}
                                className={`cursor-pointer ${
                                  selectedStudent === student.id ? "bg-primary/10" : ""
                                }`}
                                onClick={() => setSelectedStudent(student.id)}
                              >
                                <TableCell className="font-medium">
                                  {student.name}
                                  <div className="text-xs text-gray-500">{student.sapId}</div>
                                </TableCell>
                                <TableCell>{student.class}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Report Display */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Student Report</CardTitle>
                    <CardDescription>
                      {studentReport?.student ? (
                        <span>
                          {studentReport.student.name} ({studentReport.student.sapId}) - Class {studentReport.student.class}
                        </span>
                      ) : (
                        <span>Select a student to view their report</span>
                      )}
                    </CardDescription>
                  </div>
                  {studentReport && (
                    <Button variant="outline" onClick={handleExportReport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!selectedStudent ? (
                  <div className="flex flex-col items-center justify-center space-y-2 h-96">
                    <FileText className="h-16 w-16 text-gray-300" />
                    <p className="text-gray-500">Please select a student from the list to view their report</p>
                  </div>
                ) : loadingAllReports ? (
                  <div className="flex justify-center items-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-gray-600">Loading report...</span>
                  </div>
                ) : allReportsError ? (
                  <div className="text-center py-8 text-red-500">
                    Error loading report. Please try again.
                  </div>
                ) : !studentReport?.grades?.length ? (
                  <div className="flex flex-col items-center justify-center space-y-2 h-96">
                    <FileText className="h-16 w-16 text-gray-300" />
                    <p className="text-gray-500">No grades found for this student</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Summary Table */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Subject Performance Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead className="text-center">Total Experiments</TableHead>
                                <TableHead className="text-center">Average Score</TableHead>
                                <TableHead className="text-center">Percentage</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Object.values(subjectsEnum.enum).map((subject) => {
                                const subjectGrades = studentReport.grades.filter(
                                  (grade: any) => grade.subject === subject
                                );
                                
                                const totalExperiments = subjectGrades.length;
                                
                                if (totalExperiments === 0) {
                                  return (
                                    <TableRow key={subject}>
                                      <TableCell className="font-medium">{subject}</TableCell>
                                      <TableCell className="text-center">0</TableCell>
                                      <TableCell className="text-center">-</TableCell>
                                      <TableCell className="text-center">-</TableCell>
                                    </TableRow>
                                  );
                                }
                                
                                const totalScore = subjectGrades.reduce(
                                  (acc: number, grade: any) => acc + grade.total, 0
                                );
                                const averageScore = totalScore / totalExperiments;
                                const percentage = (averageScore / 25) * 100; // 25 is max score
                                
                                return (
                                  <TableRow key={subject}>
                                    <TableCell className="font-medium">{subject}</TableCell>
                                    <TableCell className="text-center">{totalExperiments}</TableCell>
                                    <TableCell className="text-center">{averageScore.toFixed(1)}</TableCell>
                                    <TableCell className="text-center">{percentage.toFixed(1)}%</TableCell>
                                  </TableRow>
                                );
                              })}
                              
                              {/* Overall Summary */}
                              {studentReport.grades.length > 0 && (
                                <TableRow className="bg-muted/50">
                                  <TableCell className="font-bold">Overall</TableCell>
                                  <TableCell className="text-center font-medium">{studentReport.grades.length}</TableCell>
                                  <TableCell className="text-center font-medium">
                                    {(studentReport.grades.reduce((acc: number, grade: any) => acc + grade.total, 0) / studentReport.grades.length).toFixed(1)}
                                  </TableCell>
                                  <TableCell className="text-center font-medium">
                                    {((studentReport.grades.reduce((acc: number, grade: any) => acc + grade.total, 0) / studentReport.grades.length) / 25 * 100).toFixed(1)}%
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Detailed Grades Table */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Detailed Grades</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead>Exp</TableHead>
                                <TableHead className="text-center">Perf</TableHead>
                                <TableHead className="text-center">Know</TableHead>
                                <TableHead className="text-center">Impl</TableHead>
                                <TableHead className="text-center">Strat</TableHead>
                                <TableHead className="text-center">Att</TableHead>
                                <TableHead className="text-center">Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {studentReport.grades.map((grade, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{grade.subject}</TableCell>
                                  <TableCell>{grade.experimentNumber}</TableCell>
                                  <TableCell className="text-center">{grade.performance}</TableCell>
                                  <TableCell className="text-center">{grade.knowledge}</TableCell>
                                  <TableCell className="text-center">{grade.implementation}</TableCell>
                                  <TableCell className="text-center">{grade.strategy}</TableCell>
                                  <TableCell className="text-center">{grade.attitude}</TableCell>
                                  <TableCell className="text-center font-medium">{grade.total}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Comments */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Teacher Comments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {studentReport.grades
                            .filter((grade) => grade.comment)
                            .map((grade, index) => (
                              <div key={index} className="p-4 bg-gray-50 rounded-md">
                                <h4 className="font-medium mb-1">
                                  {grade.subject} - Experiment {grade.experimentNumber}
                                </h4>
                                <p className="text-sm text-gray-600">{grade.comment}</p>
                              </div>
                            ))}
                          {!studentReport.grades.some((grade) => grade.comment) && (
                            <p className="text-gray-500 text-center py-4">No comments available</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
