import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProgressDisplay } from "@/components/ui/progress-display";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: number;
}

export function ReportModal({ isOpen, onClose, studentId }: ReportModalProps) {
  const [selectedTab, setSelectedTab] = useState<string>("overview");

  const { data: report, isLoading } = useQuery({
    queryKey: [studentId ? `/api/reports/student/${studentId}` : null],
    enabled: isOpen && !!studentId,
  });

  // Reset selected tab when opening a new student report
  useEffect(() => {
    if (isOpen) {
      setSelectedTab("overview");
    }
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isLoading ? (
              "Loading Report..."
            ) : report ? (
              `Student Report - ${report.student.name} (${report.student.sapId})`
            ) : (
              "Student Report"
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : report ? (
          <div className="overflow-y-auto flex-1">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="subjects">Subjects</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="pt-4">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-sm font-medium text-neutral-700">Name</div>
                    <div className="text-base">{report.student.name}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-700">SAP ID</div>
                    <div className="text-base">{report.student.sapId}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-700">Class</div>
                    <div className="text-base">{report.student.className}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-700">Overall Grade</div>
                    <div className="text-base font-semibold text-primary">{report.overall.grade} ({report.overall.percentage.toFixed(1)}%)</div>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-neutral-700 mb-2">Performance Summary</h4>
                <div className="bg-neutral-50 p-4 rounded-md mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(report.subjects).map(([code, subject]: [string, any]) => (
                      <div key={code}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{code}</span>
                          <span className="text-sm">
                            {subject.totalMarks}/{subject.maxMarks} ({((subject.totalMarks / subject.maxMarks) * 100).toFixed(0)}%)
                          </span>
                        </div>
                        <ProgressDisplay
                          value={subject.totalMarks}
                          max={subject.maxMarks}
                          size="sm"
                          color={
                            subject.totalMarks / subject.maxMarks >= 0.8
                              ? "success"
                              : subject.totalMarks / subject.maxMarks >= 0.6
                              ? "primary"
                              : subject.totalMarks / subject.maxMarks >= 0.4
                              ? "warning"
                              : "error"
                          }
                        />
                      </div>
                    ))}
                    <div className="col-span-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-semibold">Overall</span>
                        <span className="text-sm font-semibold">
                          {report.overall.totalMarks}/{report.overall.maxMarks} ({report.overall.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <ProgressDisplay
                        value={report.overall.totalMarks}
                        max={report.overall.maxMarks}
                        size="md"
                        color={
                          report.overall.percentage >= 80
                            ? "success"
                            : report.overall.percentage >= 60
                            ? "primary"
                            : report.overall.percentage >= 40
                            ? "warning"
                            : "error"
                        }
                      />
                    </div>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-neutral-700 mb-2">Metric Breakdown</h4>
                <div className="bg-neutral-50 p-4 rounded-md">
                  {Object.entries(report.metrics).map(([metric, value]: [string, any]) => (
                    <div key={metric} className="mb-3 last:mb-0">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-sm text-neutral-700 capitalize">{metric}</div>
                        <div className="text-sm text-neutral-700">{value.toFixed(1)}/5</div>
                      </div>
                      <ProgressDisplay
                        value={value}
                        max={5}
                        size="sm"
                        color="primary"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="subjects" className="pt-4 space-y-4">
                {Object.entries(report.subjects).map(([code, subject]: [string, any]) => (
                  <div key={code} className="bg-neutral-50 p-4 rounded-md">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">{code} - {subject.subjectName}</h4>
                      <span className="text-sm font-medium">
                        {subject.totalMarks}/{subject.maxMarks} ({((subject.totalMarks / subject.maxMarks) * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <Separator className="mb-3" />
                    <div className="space-y-2">
                      {subject.experiments.map((exp: any, idx: number) => (
                        <div key={idx} className="grid grid-cols-6 gap-2 text-sm">
                          <div className="col-span-2">Experiment {exp.experimentNumber}</div>
                          <div>P: {exp.performance}</div>
                          <div>K: {exp.knowledge}</div>
                          <div>I: {exp.implementation}</div>
                          <div>S: {exp.strategy}</div>
                          <div>A: {exp.attitude}</div>
                          <div className="col-span-6 flex justify-between mt-1">
                            <span>Total: {exp.totalMarks}/{exp.maxMarks}</span>
                            <ProgressDisplay
                              value={exp.totalMarks}
                              max={exp.maxMarks}
                              size="sm"
                              color="primary"
                              className="flex-1 mx-4"
                            />
                          </div>
                          {idx < subject.experiments.length - 1 && <Separator className="col-span-6 my-1" />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="metrics" className="pt-4">
                <h4 className="text-sm font-semibold text-neutral-700 mb-2">Detailed Metrics</h4>
                <div className="bg-neutral-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 gap-6">
                    {Object.entries(report.metrics).map(([metric, value]: [string, any]) => (
                      <div key={metric}>
                        <h5 className="font-medium mb-2 capitalize">{metric} ({value.toFixed(1)}/5)</h5>
                        <ProgressDisplay 
                          value={value} 
                          max={5} 
                          size="md"
                          color="primary"
                          className="mb-2"
                        />
                        <div className="grid grid-cols-5 gap-2 text-xs mt-2">
                          {Object.entries(report.subjects).map(([code, subject]: [string, any]) => {
                            // Calculate average for this metric across all experiments in this subject
                            const metricValues = subject.experiments
                              .map((exp: any) => exp[metric as keyof typeof exp])
                              .filter((val: any) => val !== undefined);
                            
                            const average = metricValues.length
                              ? metricValues.reduce((a: number, b: number) => a + b, 0) / metricValues.length
                              : 0;
                            
                            return (
                              <div key={code} className="bg-white p-2 rounded border">
                                <div className="font-medium mb-1">{code}</div>
                                <div className="text-sm">{average.toFixed(1)}/5</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-500">
            No report data available for this student.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handlePrintReport} className="flex items-center gap-2">
            <span className="material-icons text-sm">print</span>
            Print
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <span className="material-icons text-sm">download</span>
            Export PDF
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
