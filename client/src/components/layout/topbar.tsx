import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TopBarProps {
  title: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export function TopBar({ title, className, onSearch }: TopBarProps) {
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <header className={cn("hidden md:flex bg-white shadow-sm h-16 items-center px-6", className)}>
      <div>
        <h2 className="text-xl font-medium text-neutral-800">{title}</h2>
      </div>
      <div className="ml-auto flex items-center space-x-4">
        {onSearch && (
          <form className="relative" onSubmit={handleSearch}>
            <Input
              type="text"
              name="search"
              placeholder="Search students..."
              className="pl-10 pr-4 py-2 rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="material-icons absolute left-3 top-2 text-neutral-500">search</span>
          </form>
        )}
        <Button variant="ghost" size="icon" className="rounded-full">
          <span className="material-icons text-neutral-700">notifications</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <span className="material-icons text-neutral-700">help_outline</span>
        </Button>
      </div>
    </header>
  );
}
