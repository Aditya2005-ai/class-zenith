import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, Calendar, Clock, User } from "lucide-react";

// Sample faculty data
const sampleFaculty = [
  {
    id: "1",
    name: "Dr. Neetu Agrawal",
    code: "NA",
    department: "Pharmaceutics",
    subjects: ["BP 301 T"],
    maxHours: 20,
    currentHours: 16,
    availability: "Available",
    email: "neetu.agrawal@gla.ac.in"
  },
  {
    id: "2", 
    name: "Dr. Poornima Agrawal",
    code: "PA",
    department: "Pharmaceutics",
    subjects: ["BP 302 T"],
    maxHours: 18,
    currentHours: 14,
    availability: "Available",
    email: "poornima.agrawal@gla.ac.in"
  },
  {
    id: "3",
    name: "Dr. Rohitas Desmukh", 
    code: "RD",
    department: "Pharmaceutics",
    subjects: ["BP 303 T"],
    maxHours: 22,
    currentHours: 20,
    availability: "Overloaded",
    email: "rohitas.desmukh@gla.ac.in"
  },
  {
    id: "4",
    name: "Dr. Bharti Mangla",
    code: "BM", 
    department: "Pharmaceutics",
    subjects: ["BP 304 T", "BP 308 P"],
    maxHours: 20,
    currentHours: 18,
    availability: "Available",
    email: "bharti.mangla@gla.ac.in"
  },
  {
    id: "5",
    name: "Dr. Kamal Shah",
    code: "KS",
    department: "Pharmacology",
    subjects: ["BP 701 T", "BP 305 P"],
    maxHours: 24,
    currentHours: 22,
    availability: "Available",
    email: "kamal.shah@gla.ac.in"
  }
];

const FacultyManager = () => {
  const [faculty, setFaculty] = useState(sampleFaculty);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredFaculty = faculty.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === "all" || member.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getAvailabilityBadge = (availability: string, currentHours: number, maxHours: number) => {
    const utilization = (currentHours / maxHours) * 100;
    
    if (utilization >= 100) {
      return <Badge variant="destructive">Overloaded</Badge>;
    } else if (utilization >= 80) {
      return <Badge className="bg-orange-500 hover:bg-orange-600">High Load</Badge>;
    } else if (utilization >= 60) {
      return <Badge variant="secondary">Moderate</Badge>;
    } else {
      return <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Faculty Management</h2>
          <p className="text-muted-foreground">Manage faculty workload and availability</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Faculty
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Faculty Member</DialogTitle>
              <DialogDescription>
                Enter faculty details and teaching preferences
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" placeholder="Dr. Faculty Name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">Code</Label>
                <Input id="code" placeholder="FC" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">Department</Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pharmaceutics">Pharmaceutics</SelectItem>
                    <SelectItem value="pharmacology">Pharmacology</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy Practice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxHours" className="text-right">Max Hours</Label>
                <Input id="maxHours" type="number" placeholder="20" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subjects" className="text-right">Subjects</Label>
                <Textarea id="subjects" placeholder="BP 301 T, BP 302 P" className="col-span-3" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Add Faculty</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search faculty by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Pharmaceutics">Pharmaceutics</SelectItem>
                <SelectItem value="Pharmacology">Pharmacology</SelectItem>
                <SelectItem value="Pharmacy Practice">Pharmacy Practice</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{faculty.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {faculty.filter(f => (f.currentHours / f.maxHours) < 0.8).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Workload</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {faculty.filter(f => (f.currentHours / f.maxHours) >= 0.8 && (f.currentHours / f.maxHours) < 1).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overloaded</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {faculty.filter(f => (f.currentHours / f.maxHours) >= 1).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Faculty Table */}
      <Card>
        <CardHeader>
          <CardTitle>Faculty Directory</CardTitle>
          <CardDescription>Complete list of faculty members and their workload status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Workload</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFaculty.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{member.code}</Badge>
                  </TableCell>
                  <TableCell>{member.department}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.subjects.map((subject, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{member.currentHours}/{member.maxHours}h</span>
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ width: `${Math.min((member.currentHours / member.maxHours) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getAvailabilityBadge(member.availability, member.currentHours, member.maxHours)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyManager;