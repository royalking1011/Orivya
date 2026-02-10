import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function AuthPage() {
  const { login, register, isLoggingIn, isRegistering, user } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation("/");
    return null;
  }

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    login(Object.fromEntries(formData));
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    register(Object.fromEntries(formData));
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-serif">Welcome</CardTitle>
            <CardDescription>
              Sign in to access your account and order history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" required className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required className="bg-gray-50" />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoggingIn}>
                    {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Full Name</Label>
                    <Input id="reg-name" name="name" required className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input id="reg-email" name="email" type="email" required className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-user">Username</Label>
                    <Input id="reg-user" name="username" required className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-pass">Password</Label>
                    <Input id="reg-pass" name="password" type="password" required className="bg-gray-50" />
                  </div>
                  <Button type="submit" className="w-full" disabled={isRegistering}>
                    {isRegistering ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
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
