import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Settings, BellRing, FileText } from "lucide-react";

const WorkflowManagement = () => {
  const requests = [
    { request: "Change class slot - Math 101", status: "Pending" },
    { request: "Add lab session - CS 305", status: "Approved" }
  ];

  return (
    <div className="p-6 grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <Settings className="h-8 w-8 text-primary" />
          <CardTitle>Approval Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {requests.map((r, i) => (
              <li key={i} className="p-3 bg-muted rounded-md">
                {r.request} — <span className="font-semibold">{r.status}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <BellRing className="h-8 w-8 text-primary" />
          <CardTitle>Notification System</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Faculty and students get real-time alerts on schedule changes and approvals.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowManagement;
