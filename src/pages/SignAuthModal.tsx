import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";

const SignAuthModal = () => {
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(0);

  // simple password strength checker
  const checkStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length > 5) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;
    setStrength(score);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="px-6 py-2">Sign In / Sign Up</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Welcome to EduFlex</DialogTitle>
          <DialogDescription className="text-center">
            Access your optimized timetable & resources seamlessly
          </DialogDescription>
        </DialogHeader>

        {/* Tabs for Sign In / Sign Up */}
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* --- Sign In --- */}
          <TabsContent value="signin" className="space-y-4">
            <div>
              <Label htmlFor="signin-email">Email</Label>
              <Input id="signin-email" type="email" placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="signin-password">Password</Label>
              <Input id="signin-password" type="password" placeholder="••••••••" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" /> Remember Me
              </label>
              <a href="#" className="text-sm text-primary hover:underline">Forgot Password?</a>
            </div>
            <Button className="w-full">Sign In</Button>
          </TabsContent>

          {/* --- Sign Up --- */}
          <TabsContent value="signup" className="space-y-4">
            <div>
              <Label htmlFor="signup-name">Full Name</Label>
              <Input id="signup-name" type="text" placeholder="John Doe" />
            </div>
            <div>
              <Label htmlFor="signup-email">Email</Label>
              <Input id="signup-email" type="email" placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  checkStrength(e.target.value);
                }}
              />
              <Progress value={strength} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Strength: {strength < 50 ? "Weak" : strength < 75 ? "Medium" : "Strong"}
              </p>
            </div>
            <Button className="w-full">Create Account</Button>
          </TabsContent>
        </Tabs>

        {/* Social logins */}
        <div className="mt-6">
          <p className="text-center text-sm text-muted-foreground mb-3">Or continue with</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Google
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Github className="h-4 w-4" /> GitHub
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Linkedin className="h-4 w-4" /> LinkedIn
            </Button>
          </div>
        </div>

        {/* AI creative touch */}
        <motion.div
          className="mt-6 p-4 text-center text-sm rounded-md bg-gradient-to-r from-primary/10 to-secondary/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          💡 AI Suggestion: Use a strong passphrase (e.g., “Campus!2025Growth”) for better security.
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default SignAuthModal;
