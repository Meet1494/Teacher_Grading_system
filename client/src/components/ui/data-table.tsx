import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Save, MessageSquare } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Student, Grade } from "@shared/schema";

interface GradingTableProps {
  students: Student[];
  subject: string;
  experimentNumber: number;
  gradesData: Record<number, Grade>;
  onOpenCommentModal: (student: Student) => void;
  onOpenAddStudentModal: () => void;
}

interface StudentGrade {
  studentId: number;
  performance: number;
  knowledge: number;
  implementation: number;
  strategy: number;
  attitude: number;
  total: number;
  hasChanges: boolean;
}

export function GradingTable({
  students,
  subject,
  experimentNumber,
  gradesData,
  onOpenCommentModal,
  onOpenAddStudentModal,
}: GradingTableProps) {
  const { toast } = useToast();
  const [grades, setGrades] = useState<Record<number, StudentGrade>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // Initialize grades from the gradesData
    const initialGrades: Record<number, StudentGrade> = {};
    
    students.forEach(student => {
      const grade = gradesData[student.id];
      initialGrades[student.id] = {
        studentId: student.id,
        performance: grade?.performance ?? 0,
        knowledge: grade?.knowledge ?? 0,
        implementation: grade?.implementation ?? 0,
        strategy: grade?.strategy ?? 0,
        attitude: grade?.attitude ?? 0,
        total: grade ? (
          grade.performance + grade.knowledge + grade.implementation + 
          grade.strategy + grade.attitude
        ) : 0,
        hasChanges: false
      };
    });
    
    setGrades(initialGrades);
  }, [students, gradesData]);

  const handleGradeChange = (
    studentId: number,
    parameter: keyof Omit<StudentGrade, "studentId" | "total" | "hasChanges">,
    value: string
  ) => {
    // Parse and clamp the value between 0 and 5
    const numValue = Math.min(5, Math.max(0, parseInt(value) || 0));
    
    setGrades(prev => {
      const studentGrade = prev[studentId] || {
        studentId,
        performance: 0,
        knowledge: 0,
        implementation: 0,
        strategy: 0,
        attitude: 0,
        total: 0,
        hasChanges: false
      };
      
      // Check if the value is actually different from current
      if (studentGrade[parameter] === numValue) {
        return prev;
      }
      
      const updatedGrade = {
        ...studentGrade,
        [parameter]: numValue,
        hasChanges: true
      };
      
      // Recalculate total
      updatedGrade.total = 
        updatedGrade.performance + 
        updatedGrade.knowledge + 
        updatedGrade.implementation + 
        updatedGrade.strategy + 
        updatedGrade.attitude;
      
      return { ...prev, [studentId]: updatedGrade };
    });
  };

  const saveGrade = async (studentId: number) => {
    const studentGrade = grades[studentId];
    if (!studentGrade || !studentGrade.hasChanges) return;
    
    setSaving(prev => ({ ...prev, [studentId]: true }));
    
    try {
      const gradeData = {
        studentId,
        subject,
        experimentNumber,
        performance: studentGrade.performance,
        knowledge: studentGrade.knowledge,
        implementation: studentGrade.implementation,
        strategy: studentGrade.strategy,
        attitude: studentGrade.attitude,
        comment: gradesData[studentId]?.comment || ""
      };
      
      await apiRequest("POST", "/api/grades", gradeData);
      
      // Update the grade in the local state
      setGrades(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          hasChanges: false
        }
      }));
      
      // Invalidate the query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/grades'] });
      
      toast({
        title: "Grade saved",
        description: "The grade has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error saving grade",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const saveAllGrades = async () => {
    // Find all students with changes
    const studentsWithChanges = Object.entries(grades)
      .filter(([_, grade]) => grade.hasChanges)
      .map(([id]) => parseInt(id));
    
    if (studentsWithChanges.length === 0) {
      toast({
        title: "No changes to save",
        description: "No grade changes were detected",
      });
      return;
    }
    
    // Save each student's grade
    for (const studentId of studentsWithChanges) {
      await saveGrade(studentId);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="flex justify-end p-4">
        <Button onClick={saveAllGrades} className="bg-primary hover:bg-primary/90">
          <Save className="mr-2 h-4 w-4" />
          Save All
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-gray-50 z-10">Student</TableHead>
              <TableHead>SAP ID</TableHead>
              <TableHead className="text-center">Performance<br/>(5)</TableHead>
              <TableHead className="text-center">Knowledge<br/>(5)</TableHead>
              <TableHead className="text-center">Implementation<br/>(5)</TableHead>
              <TableHead className="text-center">Strategy<br/>(5)</TableHead>
              <TableHead className="text-center">Attitude<br/>(5)</TableHead>
              <TableHead className="text-center">Total<br/>(25)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="sticky left-0 bg-white z-10">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 bg-gray-200 text-gray-600">
                      <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500">{student.sapId}</TableCell>
                <TableCell className="text-center">
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    className="w-12 p-1 text-center"
                    value={grades[student.id]?.performance ?? 0}
                    onChange={(e) => handleGradeChange(student.id, "performance", e.target.value)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    className="w-12 p-1 text-center"
                    value={grades[student.id]?.knowledge ?? 0}
                    onChange={(e) => handleGradeChange(student.id, "knowledge", e.target.value)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    className="w-12 p-1 text-center"
                    value={grades[student.id]?.implementation ?? 0}
                    onChange={(e) => handleGradeChange(student.id, "implementation", e.target.value)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    className="w-12 p-1 text-center"
                    value={grades[student.id]?.strategy ?? 0}
                    onChange={(e) => handleGradeChange(student.id, "strategy", e.target.value)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    className="w-12 p-1 text-center"
                    value={grades[student.id]?.attitude ?? 0}
                    onChange={(e) => handleGradeChange(student.id, "attitude", e.target.value)}
                  />
                </TableCell>
                <TableCell className="text-center font-medium">
                  <span className="text-lg">{grades[student.id]?.total ?? 0}</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => saveGrade(student.id)}
                    disabled={saving[student.id] || !grades[student.id]?.hasChanges}
                    className={grades[student.id]?.hasChanges ? "text-primary hover:text-blue-700" : "text-gray-400"}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenCommentModal(student)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={9} className="sticky left-0 bg-white">
                <Button 
                  variant="ghost" 
                  className="text-primary hover:text-blue-700 p-0"
                  onClick={onOpenAddStudentModal}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add New Student
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
