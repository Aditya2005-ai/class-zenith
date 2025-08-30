import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, MapPin, Edit } from "lucide-react";

// Sample timetable data based on the CSV structure
const sampleTimetableData = {
  "B.Pharm-3rd-A": {
    name: "B.Pharm 3rd Year - Section A",
    schedule: {
      "Monday": [
        { time: "8:00-8:55", subject: "BP 305 P", faculty: "SP", room: "P006", type: "practical", batch: "A" },
        { time: "8:55-9:50", subject: "", faculty: "", room: "", type: "break" },
        { time: "9:50-10:40", subject: "", faculty: "", room: "", type: "break" },
        { time: "10:40-11:30", subject: "", faculty: "", room: "", type: "break" },
        { time: "11:30-12:30", subject: "BREAK", faculty: "", room: "", type: "break" },
        { time: "12:30-1:25", subject: "PDP", faculty: "VK", room: "304", type: "theory" },
        { time: "1:25-2:20", subject: "", faculty: "", room: "", type: "break" },
        { time: "2:20-3:10", subject: "", faculty: "", room: "", type: "break" },
        { time: "3:10-4:00", subject: "", faculty: "", room: "", type: "break" },
      ],
      "Tuesday": [
        { time: "8:00-8:55", subject: "BP 307 P", faculty: "BM", room: "P103", type: "practical", batch: "B" },
        { time: "8:55-9:50", subject: "", faculty: "", room: "", type: "break" },
        { time: "9:50-10:40", subject: "", faculty: "", room: "", type: "break" },
        { time: "10:40-11:30", subject: "", faculty: "", room: "", type: "break" },
        { time: "11:30-12:30", subject: "BREAK", faculty: "", room: "", type: "break" },
        { time: "12:30-1:25", subject: "BP 302 T", faculty: "PA", room: "216", type: "theory" },
        { time: "1:25-2:20", subject: "BP 303 T", faculty: "RD", room: "216", type: "theory" },
        { time: "2:20-3:10", subject: "BP 304 T", faculty: "BM", room: "216", type: "theory" },
        { time: "3:10-4:00", subject: "BP 301 T", faculty: "NA", room: "216", type: "theory" },
      ],
      // Add more days...
    }
  }
};

const TimetableGrid = () => {
  const [selectedClass, setSelectedClass] = useState("B.Pharm-3rd-A");
  const [selectedDay, setSelectedDay] = useState("Monday");
  
  const currentTimetable = sampleTimetableData[selectedClass as keyof typeof sampleTimetableData];
  const timeSlots = ["8:00-8:55", "8:55-9:50", "9:50-10:40", "10:40-11:30", "11:30-12:30", "12:30-1:25", "1:25-2:20", "2:20-3:10", "3:10-4:00"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const getSubjectColor = (type: string) => {
    switch (type) {
      case "theory": return "bg-primary/10 border-primary/20 text-primary";
      case "practical": return "bg-secondary/10 border-secondary/20 text-secondary-foreground";
      case "break": return "bg-muted border-muted";
      default: return "bg-card border-border";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Timetable Management</h2>
          <p className="text-muted-foreground">View and manage class schedules</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="B.Pharm-3rd-A">B.Pharm 3rd Year - Section A</SelectItem>
              <SelectItem value="B.Pharm-3rd-B">B.Pharm 3rd Year - Section B</SelectItem>
              <SelectItem value="B.Pharm-5th-A">B.Pharm 5th Year - Section A</SelectItem>
              <SelectItem value="M.Pharm-Pharm">M.Pharm Pharmaceutics</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Schedule
          </Button>
        </div>
      </div>

      {/* Timetable Tabs */}
      <Tabs value="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {currentTimetable?.name}
                  </CardTitle>
                  <CardDescription>Weekly schedule overview</CardDescription>
                </div>
                <Badge variant="secondary">AY 2025-26</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Timetable Grid */}
              <div className="overflow-x-auto">
                <div className="min-w-full grid grid-cols-6 gap-1 text-sm">
                  {/* Header Row */}
                  <div className="font-semibold p-3 bg-muted text-center">Time</div>
                  {days.map(day => (
                    <div key={day} className="font-semibold p-3 bg-muted text-center">{day}</div>
                  ))}
                  
                  {/* Time Slots */}
                  {timeSlots.map(timeSlot => (
                    <div key={timeSlot} className="contents">
                      <div className="font-medium p-3 bg-muted/50 text-center border-r">
                        <Clock className="h-4 w-4 mx-auto mb-1" />
                        {timeSlot}
                      </div>
                      {days.map(day => {
                        const daySchedule = currentTimetable?.schedule[day] || [];
                        const slotData = daySchedule.find(slot => slot.time === timeSlot);
                        
                        return (
                          <div key={`${day}-${timeSlot}`} className={`p-2 border min-h-[80px] ${getSubjectColor(slotData?.type || 'break')}`}>
                            {slotData?.subject && slotData.subject !== "BREAK" && (
                              <div className="space-y-1">
                                <div className="font-medium text-xs">{slotData.subject}</div>
                                {slotData.faculty && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <Users className="h-3 w-3" />
                                    {slotData.faculty}
                                  </div>
                                )}
                                {slotData.room && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <MapPin className="h-3 w-3" />
                                    {slotData.room}
                                  </div>
                                )}
                                {slotData.batch && (
                                  <Badge variant="outline" className="text-xs h-4 px-1">
                                    Batch {slotData.batch}
                                  </Badge>
                                )}
                              </div>
                            )}
                            {slotData?.subject === "BREAK" && (
                              <div className="text-center text-xs text-muted-foreground">Break</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Schedule List View</CardTitle>
              <CardDescription>Detailed class information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">List view implementation coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Conflicts</CardTitle>
              <CardDescription>Identify and resolve scheduling conflicts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Conflict detection system coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimetableGrid;