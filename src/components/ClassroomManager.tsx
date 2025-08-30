import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Edit, Trash2, MapPin, Users, Monitor, Settings } from "lucide-react";

// Sample classroom data
const sampleClassrooms = [
  {
    id: "1",
    name: "Room 216",
    type: "Theory",
    capacity: 60,
    building: "Main Block",
    floor: "2nd Floor",
    equipment: ["Projector", "Audio System", "AC"],
    utilization: 85,
    status: "Available"
  },
  {
    id: "2", 
    name: "P006",
    type: "Practical Lab",
    capacity: 30,
    building: "Pharmacy Block",
    floor: "Ground Floor",
    equipment: ["Lab Equipment", "Fume Hood", "Storage"],
    utilization: 75,
    status: "Available"
  },
  {
    id: "3",
    name: "P103",
    type: "Practical Lab", 
    capacity: 25,
    building: "Pharmacy Block",
    floor: "1st Floor",
    equipment: ["Lab Equipment", "Microscopes", "Computer"],
    utilization: 90,
    status: "High Demand"
  },
  {
    id: "4",
    name: "P205",
    type: "Practical Lab",
    capacity: 35,
    building: "Pharmacy Block", 
    floor: "2nd Floor",
    equipment: ["Advanced Equipment", "Research Setup"],
    utilization: 65,
    status: "Available"
  },
  {
    id: "5",
    name: "P210", 
    type: "Practical Lab",
    capacity: 40,
    building: "Pharmacy Block",
    floor: "2nd Floor", 
    equipment: ["Lab Equipment", "Chemical Storage", "Safety Equipment"],
    utilization: 80,
    status: "Available"
  },
  {
    id: "6",
    name: "Room 114",
    type: "Theory",
    capacity: 50,
    building: "Academic Block",
    floor: "1st Floor",
    equipment: ["Smart Board", "Audio System", "AC"],
    utilization: 70,
    status: "Available"
  },
  {
    id: "7",
    name: "Room 304",
    type: "Seminar Hall",
    capacity: 100,
    building: "Main Block",
    floor: "3rd Floor",
    equipment: ["Projector", "Audio/Video", "Microphone", "AC"],
    utilization: 45,
    status: "Available"
  }
];

const ClassroomManager = () => {
  const [classrooms, setClassrooms] = useState(sampleClassrooms);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredClassrooms = classrooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.building.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || room.type === filterType;
    return matchesSearch && matchesType;
  });

  const getUtilizationBadge = (utilization: number) => {
    if (utilization >= 90) {
      return <Badge variant="destructive">Overutilized</Badge>;
    } else if (utilization >= 70) {
      return <Badge className="bg-orange-500 hover:bg-orange-600">High Usage</Badge>;
    } else if (utilization >= 50) {
      return <Badge variant="secondary">Moderate</Badge>;
    } else {
      return <Badge className="bg-green-500 hover:bg-green-600">Low Usage</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Theory":
        return <Monitor className="h-4 w-4" />;
      case "Practical Lab":
        return <Settings className="h-4 w-4" />;
      case "Seminar Hall":
        return <Users className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Classroom Management</h2>
          <p className="text-muted-foreground">Manage classrooms, labs, and resource allocation</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Classroom
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Classroom</DialogTitle>
              <DialogDescription>
                Enter classroom details and equipment information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="roomName" className="text-right">Name</Label>
                <Input id="roomName" placeholder="Room 101" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="roomType" className="text-right">Type</Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="theory">Theory Room</SelectItem>
                    <SelectItem value="practical">Practical Lab</SelectItem>
                    <SelectItem value="seminar">Seminar Hall</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="capacity" className="text-right">Capacity</Label>
                <Input id="capacity" type="number" placeholder="50" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="building" className="text-right">Building</Label>
                <Input id="building" placeholder="Main Block" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="floor" className="text-right">Floor</Label>
                <Input id="floor" placeholder="1st Floor" className="col-span-3" />
              </div>
              <div className="space-y-2">
                <Label>Equipment</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="projector" />
                    <Label htmlFor="projector" className="text-sm">Projector</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="ac" />
                    <Label htmlFor="ac" className="text-sm">Air Conditioning</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="audio" />
                    <Label htmlFor="audio" className="text-sm">Audio System</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="computer" />
                    <Label htmlFor="computer" className="text-sm">Computer</Label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Add Classroom</Button>
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
                  placeholder="Search by room name or building..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Theory">Theory Rooms</SelectItem>
                <SelectItem value="Practical Lab">Practical Labs</SelectItem>
                <SelectItem value="Seminar Hall">Seminar Halls</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Classroom Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classrooms.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Theory Rooms</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classrooms.filter(r => r.type === "Theory").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Practical Labs</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classrooms.filter(r => r.type === "Practical Lab").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Utilization</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(classrooms.reduce((acc, r) => acc + r.utilization, 0) / classrooms.length)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classroom Table */}
      <Card>
        <CardHeader>
          <CardTitle>Classroom Directory</CardTitle>
          <CardDescription>Complete list of classrooms and their utilization status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClassrooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(room.type)}
                      {room.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{room.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {room.capacity}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{room.building}</div>
                      <div className="text-muted-foreground">{room.floor}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {room.equipment.slice(0, 2).map((equipment, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {equipment}
                        </Badge>
                      ))}
                      {room.equipment.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{room.equipment.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{room.utilization}%</span>
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ width: `${room.utilization}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getUtilizationBadge(room.utilization)}
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

export default ClassroomManager;