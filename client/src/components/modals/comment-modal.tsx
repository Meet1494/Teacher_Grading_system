import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Student } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  subject: string;
  experimentNumber: number;
  comment: string;
}

export function CommentModal({
  isOpen,
  onClose,
  student,
  subject,
  experimentNumber,
  comment: initialComment,
}: CommentModalProps) {
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setComment(initialComment || "");
    }
  }, [isOpen, initialComment]);

  const handleSave = async () => {
    if (!student) return;

    try {
      setIsSaving(true);
      
      const gradeData = {
        studentId: student.id,
        subject,
        experimentNumber,
        comment,
      };

      await apiRequest("POST", "/api/grades", gradeData);
      
      // Invalidate the query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/grades'] });
      
      toast({
        title: "Comment saved",
        description: "Your comment has been saved successfully.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error saving comment",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Comments for {student?.name}</DialogTitle>
          <DialogDescription>
            Add your feedback and comments for this student's experiment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <Textarea
            id="commentText"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add your comments here..."
            rows={4}
            className="w-full"
          />
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Comment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
