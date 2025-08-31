import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, RefreshCcw, AlertTriangle } from "lucide-react";

const SmartScheduling = () => {
  const [loading, setLoading] = useState(false);
  const [timetables, setTimetables] = useState<string[]>([]);

  const generateSchedules = () => {
    setLoading(true);
    setTimeout(() => {
      setTimetables([
        "Optimized Schedule A (Balanced workload)",
        "Optimized Schedule B (Room utilization priority)",
        "Optimized Schedule C (Student-friendly slots)"
      ]);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <Calendar className="h-8 w-8 text-primary" />
          <CardTitle>AI-Powered Smart Scheduling</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Generate optimized timetables considering constraints like faculty load, classroom usage, and student preferences.
          </p>
          <Button onClick={generateSchedules} disabled={loading}>
            {loading ? "Generating..." : "Generate Timetables"}
          </Button>
          {timetables.length > 0 && (
            <ul className="mt-4 space-y-2">
              {timetables.map((t, i) => (
                <li key={i} className="p-3 bg-muted rounded-md">{t}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <CardTitle>Conflict Detector</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            AI highlights overlapping schedules in real-time and suggests fixes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartScheduling;
