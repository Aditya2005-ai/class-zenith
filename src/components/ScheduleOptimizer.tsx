import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Target, Clock, Users, BookOpen, AlertCircle, CheckCircle, Settings } from "lucide-react";

const ScheduleOptimizer = () => {
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [maxClassesPerDay, setMaxClassesPerDay] = useState([6]);
  const [maxHoursPerWeek, setMaxHoursPerWeek] = useState([25]);
  const [facultyWorkloadWeight, setFacultyWorkloadWeight] = useState([70]);
  const [classroomUtilizationWeight, setClassroomUtilizationWeight] = useState([80]);

  const optimizationResults = [
    {
      id: "1",
      name: "Optimal Schedule A",
      score: 94.5,
      faculty_efficiency: 92,
      classroom_utilization: 87,
      conflicts: 2,
      description: "High faculty efficiency, moderate classroom usage"
    },
    {
      id: "2", 
      name: "Balanced Schedule B",
      score: 91.2,
      faculty_efficiency: 88,
      classroom_utilization: 94,
      conflicts: 1,
      description: "Excellent classroom utilization, good faculty balance"
    },
    {
      id: "3",
      name: "Conflict-Free Schedule C", 
      score: 89.8,
      faculty_efficiency: 85,
      classroom_utilization: 82,
      conflicts: 0,
      description: "Zero conflicts, balanced resource usage"
    }
  ];

  const handleOptimize = () => {
    setOptimizing(true);
    setOptimizationProgress(0);
    
    // Simulate optimization progress
    const interval = setInterval(() => {
      setOptimizationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setOptimizing(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Schedule Optimizer</h2>
          <p className="text-muted-foreground">Generate and optimize timetables with AI-powered algorithms</p>
        </div>
        <Button onClick={handleOptimize} disabled={optimizing}>
          <Zap className="h-4 w-4 mr-2" />
          {optimizing ? "Optimizing..." : "Generate Schedules"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Optimization Parameters */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Optimization Parameters
            </CardTitle>
            <CardDescription>Configure constraints and weights for schedule generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Department Selection */}
            <div className="space-y-2">
              <Label>Target Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="pharmaceutics">Pharmaceutics</SelectItem>
                  <SelectItem value="pharmacology">Pharmacology</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy Practice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Constraints */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4" />
                Constraints
              </h4>
              
              <div className="space-y-2">
                <Label>Max Classes per Day: {maxClassesPerDay[0]}</Label>
                <Slider
                  value={maxClassesPerDay}
                  onValueChange={setMaxClassesPerDay}
                  max={8}
                  min={4}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Max Hours per Week: {maxHoursPerWeek[0]}</Label>
                <Slider
                  value={maxHoursPerWeek}
                  onValueChange={setMaxHoursPerWeek}
                  max={35}
                  min={15}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            <Separator />

            {/* Optimization Weights */}
            <div className="space-y-4">
              <h4 className="font-semibold">Optimization Weights</h4>
              
              <div className="space-y-2">
                <Label>Faculty Workload Balance: {facultyWorkloadWeight[0]}%</Label>
                <Slider
                  value={facultyWorkloadWeight}
                  onValueChange={setFacultyWorkloadWeight}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Classroom Utilization: {classroomUtilizationWeight[0]}%</Label>
                <Slider
                  value={classroomUtilizationWeight}
                  onValueChange={setClassroomUtilizationWeight}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results and Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Optimization Progress */}
          {optimizing && (
            <Card>
              <CardHeader>
                <CardTitle>Optimization in Progress</CardTitle>
                <CardDescription>Generating optimal schedule combinations...</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(optimizationProgress)}%</span>
                  </div>
                  <Progress value={optimizationProgress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Optimization Results */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Schedule Options</CardTitle>
              <CardDescription>Top scheduling solutions based on your parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="results" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="results">Results</TabsTrigger>
                  <TabsTrigger value="comparison">Comparison</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="results" className="space-y-4">
                  {optimizationResults.map((result, index) => (
                    <Card key={result.id} className={index === 0 ? "border-primary" : ""}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold flex items-center gap-2">
                              {result.name}
                              {index === 0 && (
                                <Badge className="bg-green-500 hover:bg-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Recommended
                                </Badge>
                              )}
                            </h4>
                            <p className="text-sm text-muted-foreground">{result.description}</p>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                              {result.score}%
                            </div>
                            <div className="text-xs text-muted-foreground">Overall Score</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Faculty</span>
                            </div>
                            <div className="text-lg font-semibold">{result.faculty_efficiency}%</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Classroom</span>
                            </div>
                            <div className="text-lg font-semibold">{result.classroom_utilization}%</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <AlertCircle className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Conflicts</span>
                            </div>
                            <div className="text-lg font-semibold">{result.conflicts}</div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant={index === 0 ? "default" : "outline"}>
                            View Details
                          </Button>
                          <Button size="sm" variant="outline">
                            Apply Schedule
                          </Button>
                          <Button size="sm" variant="outline">
                            Export
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="comparison">
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-muted-foreground">Schedule comparison view coming soon...</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analysis">
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-muted-foreground">Detailed analysis view coming soon...</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ScheduleOptimizer;