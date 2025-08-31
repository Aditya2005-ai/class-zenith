import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, Building2 } from "lucide-react";

const MultiDepartment = () => {
  const departments = [
    { name: "Computer Science", programs: ["B.Tech", "M.Tech"], activeBatches: 12 },
    { name: "Mechanical", programs: ["B.Tech"], activeBatches: 8 },
    { name: "MBA", programs: ["MBA Full-Time"], activeBatches: 5 }
  ];

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <BookOpen className="h-8 w-8 text-primary" />
          <CardTitle>Departments Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {departments.map((d, i) => (
              <li key={i} className="p-3 bg-muted rounded-md">
                <strong>{d.name}</strong> — Programs: {d.programs.join(", ")} • Active Batches: {d.activeBatches}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Building2 className="h-8 w-8 text-primary" />
          <CardTitle>Cross-Department Scheduling</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Allows electives and shared classes between different departments, ensuring smooth integration.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiDepartment;
