import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Mail, Lock, User2 } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

function getRedirectPath(user: any) {
  if (!user) return "/";
  if (user.role !== "customer") return "/admin";
  return "/";
}

export default function AuthPage() {
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    try {
      const loggedInUser = await login({ email, password });
      if (loggedInUser) setLocation(getRedirectPath(loggedInUser));
    } catch (err: any) {
      // ✅ no overlay crash
      toast({
        variant: "destructive",
        title: "Login failed",
        description: err.message || "Wrong email or password",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    try {
      const registeredUser = await register({ name, email, password });
      if (registeredUser) setLocation(getRedirectPath(registeredUser));
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Register failed",
        description: err.message || "Try again",
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-white via-fuchsia-50 to-indigo-50 py-12 px-4">
        <Card className="w-full max-w-md shadow-xl border bg-white/80 backdrop-blur rounded-3xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-serif">Welcome</CardTitle>
            <CardDescription>
              Login to view your profile, orders and tracking.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 rounded-2xl">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Create</TabsTrigger>
              </TabsList>

              {/* LOGIN */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-black/40" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="pl-10 bg-white rounded-2xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-4 w-4 text-black/40" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="pl-10 bg-white rounded-2xl"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-2xl"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* REGISTER */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Full Name</Label>
                    <div className="relative">
                      <User2 className="absolute left-3 top-3.5 h-4 w-4 text-black/40" />
                      <Input
                        id="reg-name"
                        name="name"
                        required
                        className="pl-10 bg-white rounded-2xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-black/40" />
                      <Input
                        id="reg-email"
                        name="email"
                        type="email"
                        required
                        className="pl-10 bg-white rounded-2xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-pass">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-4 w-4 text-black/40" />
                      <Input
                        id="reg-pass"
                        name="password"
                        type="password"
                        required
                        className="pl-10 bg-white rounded-2xl"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-2xl"
                    disabled={isRegistering}
                  >
                    {isRegistering ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
