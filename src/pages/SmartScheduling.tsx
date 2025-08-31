import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, AlertTriangle, RefreshCcw, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

// Replace your old button with:


const SmartScheduling = () => {
  const [loading, setLoading] = useState(false);
  const [timetables, setTimetables] = useState<string[]>([]);
  const [faculty, setFaculty] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [block, setBlock] = useState("");
  const [room, setRoom] = useState("");
  const [availability, setAvailability] = useState<null | "available" | "unavailable">(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Simulated AI Schedule Generator
  const generateSchedules = () => {
    setLoading(true);
    setTimeout(() => {
      setTimetables([
        "Optimized Schedule A (Balanced workload)",
        "Optimized Schedule B (Room utilization priority)",
        "Optimized Schedule C (Student-friendly slots)",
      ]);
      setLoading(false);
    }, 2000);
  };

  // AI-like Room Availability Checker
  const checkAvailability = () => {
    setLoading(true);
    setAvailability(null);
    setSuggestions([]);

    setTimeout(() => {
      if (room === "101") {
        // Assume Room 101 is already booked
        setAvailability("unavailable");
        setSuggestions(["102 (Block A)", "202 (Block B)", "305 (Block C)"]);
      } else {
        setAvailability("available");
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Smart Scheduling */}
      <Card>
        <CardHeader>
          <Calendar className="h-8 w-8 text-primary" />
          <CardTitle>AI-Powered Smart Scheduling</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Generate optimized timetables considering constraints like faculty load, classroom usage, and student preferences.
          </p>
          <Link to="/timetable-generator">
            <Button>
              Generate Timetables
            </Button>
          </Link>
          {timetables.length > 0 && (
            <ul className="mt-4 space-y-2">
              {timetables.map((t, i) => (
                <li key={i} className="p-3 bg-muted rounded-md">{t}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Conflict Detector */}
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

      {/* Rescheduling Feature */}
      <Card>
        <CardHeader>
          <RefreshCcw className="h-6 w-6 text-primary" />
          <CardTitle>Reschedule a Class</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-2">
            Reschedule a class for a faculty by checking room availability and suggesting alternatives.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Faculty Name</Label>
              <Input value={faculty} onChange={(e) => setFaculty(e.target.value)} placeholder="Dr. John Doe" />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label>Time Slot</Label>
              <Input value={slot} onChange={(e) => setSlot(e.target.value)} placeholder="10:00 - 11:00 AM" />
            </div>
            <div>
              <Label>Block</Label>
              <Input value={block} onChange={(e) => setBlock(e.target.value)} placeholder="Block A" />
            </div>
            <div className="md:col-span-2">
              <Label>Room Number</Label>
              <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="101" />
            </div>
          </div>

          <Button onClick={checkAvailability} disabled={loading || !faculty || !date || !slot || !block || !room} className="mt-4 w-full">
            {loading ? "Checking Availability..." : "Check & Reschedule"}
          </Button>

          {/* Availability Results */}
          {availability === "available" && (
            <div className="mt-4 p-4 rounded-md bg-green-100 flex items-center gap-2">
              <CheckCircle className="text-green-600" /> 
              <span className="text-green-800">Room {room} in {block} is available. Class successfully rescheduled ✅</span>
            </div>
          )}
          {availability === "unavailable" && (
            <div className="mt-4 p-4 rounded-md bg-red-100">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="text-red-600" /> 
                <span className="text-red-800">Room {room} is not available at that time ❌</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Suggested Alternatives:</p>
              <div className="flex gap-2 flex-wrap">
                {suggestions.map((s, i) => (
                  <Badge key={i} variant="secondary">{s}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartScheduling;
