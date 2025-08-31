import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Clock, Calendar } from "lucide-react";

const FacultyManagement = () => {
  const faculty = [
    { name: "Dr. Mehta", load: "12 hrs/week", leaves: "2", available: "Yes" },
    { name: "Prof. Rao", load: "15 hrs/week", leaves: "1", available: "Yes" },
    { name: "Dr. Singh", load: "10 hrs/week", leaves: "3", available: "No" },
  ];

  return (
    <div className="p-6 grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <Users className="h-8 w-8 text-primary" />
          <CardTitle>Faculty Workload Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {faculty.map((f, i) => (
              <li key={i} className="p-3 rounded bg-muted">
                <strong>{f.name}</strong> — {f.load} • Leaves: {f.leaves} • Available: {f.available}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Clock className="h-8 w-8 text-primary" />
          <CardTitle>Leave Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Faculty can submit leave requests here. AI will auto-adjust schedule to minimize clashes.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyManagement;
