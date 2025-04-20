import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { AddStudentModal } from "@/components/modals/add-student-modal";
import { Loader2, Search, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Student } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ManageStudents() {
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editName, setEditName] = useState("");
  const [editSapId, setEditSapId] = useState("");
  const [editClass, setEditClass] = useState("");

  // Fetch students
  const {
    data: students,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['/api/students', { class: selectedClass }],
  });

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: async (data: { id: number; name: string; sapId: string; class: string }) => {
      const res = await apiRequest("PATCH", `/api/students/${data.id}`, {
        name: data.name,
        sapId: data.sapId,
        class: data.class,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      toast({
        title: "Student updated",
        description: "The student details have been updated successfully",
      });
      setEditModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating student",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Filter students
  const filteredStudents = students
    ? students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.sapId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setEditName(student.name);
    setEditSapId(student.sapId);
    setEditClass(student.class);
    setEditModalOpen(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setSelectedStudent(student);
    setDeleteModalOpen(true);
  };

  const handleEditSubmit = () => {
    if (!selectedStudent) return;
    
    updateStudentMutation.mutate({
      id: selectedStudent.id,
      name: editName,
      sapId: editSapId,
      class: editClass,
    });
  };

  const handleClassFilter = (value: string) => {
    setSelectedClass(value === "all" ? null : value);
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h2 className="text-xl font-semibold text-gray-800">Manage Students</h2>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                <div>
                  <CardTitle>Students</CardTitle>
                  <CardDescription>
                    Manage and organize your students across classes
                  </CardDescription>
                </div>
                <Button onClick={() => setAddStudentModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="mb-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or SAP ID..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  value={selectedClass === null ? "all" : selectedClass}
                  onValueChange={handleClassFilter}
                >
                  <SelectTrigger className="w-[150px]">
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

              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-gray-600">Loading students...</span>
                </div>
              )}

              {/* Error State */}
              {isError && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                  <p className="text-red-700">
                    Error loading students. Please try refreshing the page.
                  </p>
                </div>
              )}

              {/* Students Table */}
              {!isLoading && !isError && (
                <>
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No students found.</p>
                      {searchQuery && (
                        <p className="text-sm text-gray-400 mt-2">
                          Try adjusting your search or filters.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>SAP ID</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">{student.name}</TableCell>
                              <TableCell>{student.sapId}</TableCell>
                              <TableCell>{student.class}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 mr-1"
                                  onClick={() => handleEditStudent(student)}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500"
                                  onClick={() => handleDeleteStudent(student)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={addStudentModalOpen}
        onClose={() => setAddStudentModalOpen(false)}
      />

      {/* Edit Student Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update the student's information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editName">Full Name</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editSapId">SAP ID</Label>
              <Input
                id="editSapId"
                value={editSapId}
                onChange={(e) => setEditSapId(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editClass">Class</Label>
              <Select value={editClass} onValueChange={setEditClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT1">IT1</SelectItem>
                  <SelectItem value="IT2">IT2</SelectItem>
                  <SelectItem value="IT3">IT3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditSubmit} 
              disabled={updateStudentMutation.isPending}
            >
              {updateStudentMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedStudent?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setDeleteModalOpen(false)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
