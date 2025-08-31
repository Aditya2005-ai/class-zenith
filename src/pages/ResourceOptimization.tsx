import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock, Monitor, Building } from "lucide-react";

const ResourceOptimization = () => {
  const rooms = [
    { block: "A", room: "101", status: "Available" },
    { block: "A", room: "102", status: "Occupied" },
    { block: "B", room: "201", status: "Available" },
  ];

  return (
    <div className="p-6 grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <Building className="h-8 w-8 text-primary" />
          <CardTitle>Room Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {rooms.map((r, i) => (
              <li key={i} className={`p-3 rounded ${r.status === "Available" ? "bg-green-100" : "bg-red-100"}`}>
                Block {r.block} • Room {r.room} — {r.status}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Monitor className="h-8 w-8 text-primary" />
          <CardTitle>Lab & Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Check lab/equipment availability and auto-assign based on course requirements.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceOptimization;
