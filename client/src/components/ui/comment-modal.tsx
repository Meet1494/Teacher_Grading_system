import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: number;
  studentName?: string;
  experimentId?: number;
  initialComment?: string;
}

export function CommentModal({ 
  isOpen, 
  onClose, 
  studentId, 
  studentName, 
  experimentId, 
  initialComment 
}: CommentModalProps) {
  const [comment, setComment] = useState(initialComment || "");
  const { toast } = useToast();

  const saveCommentMutation = useMutation({
    mutationFn: async () => {
      if (!studentId || !experimentId) return;
      
      const res = await apiRequest(
        "PUT",
        `/api/grades/${studentId}/${experimentId}`,
        { comment }
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/grades/experiment/${experimentId}`] });
      toast({
        title: "Comment saved",
        description: "Your feedback has been saved successfully.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveCommentMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Comment for {studentName || "Student"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="comment">Feedback</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your feedback here..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saveCommentMutation.isPending}
          >
            {saveCommentMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Comment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
