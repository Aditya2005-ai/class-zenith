import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, FileSpreadsheet, Share2, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const TimetableGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  // Input fields
  const [department, setDepartment] = useState("Computer Science");
  const [days, setDays] = useState([5]);
  const [periods, setPeriods] = useState([6]);
  const [subjects, setSubjects] = useState("Math, Physics, Chemistry, CS");
  const [goal, setGoal] = useState("balanced");

  // Output
  const [timetable, setTimetable] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generateTimetable = async () => {
    setLoading(true);
    setGenerated(false);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `
      You are an AI timetable generator.
      Department: ${department}
      Days per Week: ${days[0]}
      Periods per Day: ${periods[0]}
      Subjects: ${subjects}
      Goal: ${goal}

      Generate a JSON only in this format:
      {
        "timetable": [
          { "day": "Monday", "slots": ["Math", "Physics", "Free", "CS"] }
        ],
        "suggestions": ["⚡ Suggestion 1", "📌 Suggestion 2"]
      }
      `;

      const result = await model.generateContent(prompt);
      const text = (await result.response.text()).trim();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setTimetable(parsed.timetable || []);
        setSuggestions(parsed.suggestions || []);
      } else {
        setSuggestions(["❌ Failed to parse AI response."]);
      }

      setGenerated(true);
    } catch (err) {
      console.error("Error generating timetable:", err);
      setSuggestions(["❌ Error contacting AI"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>AI Timetable Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Department */}
          <div>
            <Label>Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                <SelectItem value="Mechanical">Mechanical</SelectItem>
                <SelectItem value="Civil">Civil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Days & Periods */}
          <div>
            <Label>Days per Week: {days[0]}</Label>
            <Slider min={3} max={7} step={1} value={days} onValueChange={setDays} />
          </div>
          <div>
            <Label>Periods per Day: {periods[0]}</Label>
            <Slider min={3} max={8} step={1} value={periods} onValueChange={setPeriods} />
          </div>

          {/* Subjects */}
          <div>
            <Label>Subjects (comma separated)</Label>
            <Input value={subjects} onChange={(e) => setSubjects(e.target.value)} />
          </div>

          {/* Optimization Goal */}
          <Tabs defaultValue="balanced" onValueChange={setGoal}>
            <TabsList>
              <TabsTrigger value="balanced">Balanced</TabsTrigger>
              <TabsTrigger value="resources">Resource Efficient</TabsTrigger>
              <TabsTrigger value="student">Student Friendly</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={generateTimetable} disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : "⚡ Generate Timetable"}
          </Button>

          {loading && (
            <motion.div
              className="mt-4 text-center text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              🤖 AI is generating your {goal} timetable...
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Render Timetable */}
      {generated && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Generated Timetable ({goal})</CardTitle>
            </CardHeader>
            <CardContent>
              {timetable.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 text-sm text-center">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 border">Day</th>
                        {Array.from({ length: periods[0] }).map((_, idx) => (
                          <th key={idx} className="p-2 border">Slot {idx + 1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timetable.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-2 border font-semibold">{row.day}</td>
                          {row.slots.map((slot: string, i: number) => (
                            <td key={i} className="p-2 border">{slot}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">⚠️ No timetable data received.</p>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <Button variant="outline"><Download className="w-4 h-4 mr-2"/> Export PDF</Button>
                <Button variant="outline"><FileSpreadsheet className="w-4 h-4 mr-2"/> Export Excel</Button>
                <Button variant="outline"><Share2 className="w-4 h-4 mr-2"/> Share Link</Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="text-yellow-500"/> AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  {suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default TimetableGenerator;
