import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClass?: string;
}

export function AddStudentModal({
  isOpen,
  onClose,
  defaultClass = "IT1",
}: AddStudentModalProps) {
  const [name, setName] = useState("");
  const [sapId, setSapId] = useState("");
  const [studentClass, setStudentClass] = useState(defaultClass);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setName("");
    setSapId("");
    setStudentClass(defaultClass);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Student name is required",
        variant: "destructive",
      });
      return;
    }

    if (!sapId.trim()) {
      toast({
        title: "Validation Error",
        description: "SAP ID is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const studentData = {
        name: name.trim(),
        sapId: sapId.trim(),
        class: studentClass,
      };

      await apiRequest("POST", "/api/students", studentData);
      
      toast({
        title: "Success",
        description: `Student ${name} has been added successfully.`,
      });
      
      // Invalidate the query to refresh student list
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      
      handleClose();
    } catch (error) {
      toast({
        title: "Error adding student",
        description: error instanceof Error 
          ? error.message 
          : "An unknown error occurred while adding the student.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter the details of the new student below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="sapId">SAP ID</Label>
            <Input
              id="sapId"
              value={sapId}
              onChange={(e) => setSapId(e.target.value)}
              placeholder="e.g. 60004210032"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="class">Class</Label>
            <Select value={studentClass} onValueChange={setStudentClass}>
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
          <Button variant="outline" onClick={handleClose} className="mr-2">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
