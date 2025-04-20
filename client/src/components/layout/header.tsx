import { useState } from "react";
import { useParams } from "wouter";
import { Menu } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  currentSubject: string;
  currentExperiment: string;
  selectedClass: string;
  onClassChange: (value: string) => void;
  onSearch: (query: string) => void;
  onToggleSidebar: () => void;
}

export function Header({
  currentSubject,
  currentExperiment,
  selectedClass,
  onClassChange,
  onSearch,
  onToggleSidebar,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleClassChange = (value: string) => {
    onClassChange(value);
  };

  return (
    <header className="bg-white shadow-sm z-20">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="md:hidden text-gray-500 focus:outline-none mr-2"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>

          <h2 className="text-xl font-semibold text-gray-800">
            <span>{currentSubject}</span> - <span>Experiment {currentExperiment}</span>
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* Class Selector */}
          <div className="relative">
            <Select value={selectedClass} onValueChange={handleClassChange}>
              <SelectTrigger className="w-[90px]">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IT1">IT1</SelectItem>
                <SelectItem value="IT2">IT2</SelectItem>
                <SelectItem value="IT3">IT3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
