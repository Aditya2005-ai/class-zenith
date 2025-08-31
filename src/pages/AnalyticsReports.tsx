import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3, PieChart } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Pie, PieChart as RePieChart, Cell } from "recharts";

const AnalyticsReports = () => {
  const data = [
    { name: "Classrooms", utilization: 92 },
    { name: "Labs", utilization: 85 },
    { name: "Faculty", utilization: 78 },
  ];

  const pieData = [
    { name: "Conflicts Resolved", value: 70 },
    { name: "Pending", value: 30 },
  ];

  return (
    <div className="p-6 grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <BarChart3 className="h-8 w-8 text-primary" />
          <CardTitle>Utilization Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="utilization" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <PieChart className="h-8 w-8 text-primary" />
          <CardTitle>Conflict Resolution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie data={pieData} dataKey="value" outerRadius={80} fill="#4f46e5" label>
                <Cell fill="#22c55e" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsReports;
