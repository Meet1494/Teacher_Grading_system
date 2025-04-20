import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { GradingTable } from "@/components/ui/data-table";
import { CommentModal } from "@/components/modals/comment-modal";
import { AddStudentModal } from "@/components/modals/add-student-modal";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { Student, Grade } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function GradingSheet() {
  const { subject, experiment, class: classParam } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(classParam || "IT1");
  const [searchQuery, setSearchQuery] = useState("");
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Navigate if the class changes
  useEffect(() => {
    if (selectedClass !== classParam && subject && experiment) {
      navigate(`/grade/${subject}/${experiment}/${selectedClass}`);
    }
  }, [selectedClass, classParam, subject, experiment, navigate]);
  
  // Fetch students by class
  const {
    data: students,
    isLoading: loadingStudents,
    isError: studentsError,
  } = useQuery<Student[]>({
    queryKey: ['/api/students', { class: selectedClass }],
    enabled: !!selectedClass,
  });
  
  // Fetch grades for subject and experiment
  const {
    data: gradesData,
    isLoading: loadingGrades,
    isError: gradesError
  } = useQuery<Grade[]>({
    queryKey: ['/api/grades', { 
      subject: subject, 
      experimentNumber: experiment 
    }],
    enabled: !!subject && !!experiment,
  });
  
  // Filter students by search query
  const filteredStudents = (students || []).filter((student: Student) => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.sapId.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Organize grades by student ID
  const gradesByStudent: Record<number, Grade> = {};
  if (gradesData && Array.isArray(gradesData)) {
    gradesData.forEach((grade: Grade) => {
      gradesByStudent[grade.studentId] = grade;
    });
  }
  
  const handleClassChange = (value: string) => {
    setSelectedClass(value);
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleOpenCommentModal = (student: Student) => {
    setSelectedStudent(student);
    setCommentModalOpen(true);
  };
  
  const exportToCSV = () => {
    try {
      // Create CSV content
      let csvContent = "Name,SAP ID,Performance,Knowledge,Implementation,Strategy,Attitude,Total,Comments\n";
      
      filteredStudents.forEach((student: Student) => {
        const grade = gradesByStudent[student.id];
        const total = grade 
          ? grade.performance + grade.knowledge + grade.implementation + grade.strategy + grade.attitude
          : 0;
        
        const comment = grade?.comment ? `"${grade.comment.replace(/"/g, '""')}"` : "";
        
        csvContent += `"${student.name}",${student.sapId},${grade?.performance || 0},${grade?.knowledge || 0},${grade?.implementation || 0},${grade?.strategy || 0},${grade?.attitude || 0},${total},${comment}\n`;
      });
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${subject}_Experiment${experiment}_${selectedClass}_Grades.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: "The grades have been exported to CSV format",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export the grades. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (!subject || !experiment) {
    return <div>Invalid URL parameters</div>;
  }
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          currentSubject={subject}
          currentExperiment={experiment}
          selectedClass={selectedClass}
          onClassChange={handleClassChange}
          onSearch={handleSearch}
          onToggleSidebar={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          {/* Page Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Grading Sheet</h1>
              <p className="mt-1 text-sm text-gray-500">
                Class: {selectedClass} | 
                Total Students: {filteredStudents.length}
              </p>
            </div>
            
            <div className="mt-3 sm:mt-0 space-x-2">
              <Button 
                variant="outline" 
                onClick={exportToCSV}
                disabled={loadingStudents || loadingGrades}
              >
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            </div>
          </div>
          
          {/* Loading State */}
          {(loadingStudents || loadingGrades) && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading grading sheet...</span>
            </div>
          )}
          
          {/* Error State */}
          {(studentsError || gradesError) && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-md">
              <p className="text-red-700">
                Error loading data. Please try refreshing the page.
              </p>
            </div>
          )}
          
          {/* Grading Table */}
          {!loadingStudents && !loadingGrades && !studentsError && !gradesError && (
            <GradingTable
              students={filteredStudents}
              subject={subject}
              experimentNumber={parseInt(experiment)}
              gradesData={gradesByStudent}
              onOpenCommentModal={handleOpenCommentModal}
              onOpenAddStudentModal={() => setAddStudentModalOpen(true)}
            />
          )}
        </main>
      </div>
      
      {/* Modals */}
      <CommentModal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        student={selectedStudent}
        subject={subject}
        experimentNumber={parseInt(experiment)}
        comment={selectedStudent ? gradesByStudent[selectedStudent.id]?.comment || "" : ""}
      />
      
      <AddStudentModal
        isOpen={addStudentModalOpen}
        onClose={() => setAddStudentModalOpen(false)}
        defaultClass={selectedClass}
      />
    </div>
  );
}
