import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GradeInputProps {
  initialValue?: number;
  max?: number;
  onChange?: (value: number | undefined) => void;
  onSave?: () => void;
  disabled?: boolean;
  className?: string;
  showSave?: boolean;
}

export function GradeInput({
  initialValue,
  max = 5,
  onChange,
  onSave,
  disabled = false,
  className,
  showSave = true,
}: GradeInputProps) {
  const [value, setValue] = useState<number | undefined>(initialValue);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setValue(initialValue);
    setIsDirty(false);
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue: number | undefined = undefined;
    
    if (e.target.value !== '') {
      newValue = parseInt(e.target.value);
      if (isNaN(newValue)) return;
      
      // Ensure value is within range
      if (newValue < 0) newValue = 0;
      if (newValue > max) newValue = max;
    }
    
    setValue(newValue);
    setIsDirty(newValue !== initialValue);
    
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
      setIsDirty(false);
    }
  };

  return (
    <div className={cn("flex items-center", className)}>
      <Input
        type="number"
        value={value === undefined ? '' : value}
        onChange={handleChange}
        min={0}
        max={max}
        className="w-12 p-1 text-center border rounded focus:outline-none focus:ring-2 focus:ring-primary"
        disabled={disabled}
      />
      
      {isDirty && showSave && (
        <Button
          size="icon"
          variant="ghost"
          className="text-primary hover:text-primary-foreground hover:bg-primary ml-1 h-7 w-7"
          onClick={handleSave}
          disabled={disabled}
        >
          <span className="material-icons text-sm">save</span>
        </Button>
      )}
    </div>
  );
}
