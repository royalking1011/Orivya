import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "./use-toast";
import { useLocation } from "wouter";

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // =========================
  // GET CURRENT USER
  // =========================
  const { data: user, isLoading } = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const res = await fetch(api.auth.me.path, {
        credentials: "include",
      });

      if (res.status === 401) return null;
      if (!res.ok) return null;

      return api.auth.me.responses[200].parse(await res.json());
    },
    retry: false,
  });

  // =========================
  // LOGIN
  // =========================
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const res = await fetch(api.auth.login.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        // ✅ return clean error for UI
        if (res.status === 401) {
          throw new Error("Wrong email or password");
        }
        throw new Error("Login failed, try again");
      }

      return api.auth.login.responses[200].parse(await res.json());
    },

    onSuccess: (data) => {
      queryClient.setQueryData([api.auth.me.path], data);

      toast({
        title: "Login successful",
        description: `Welcome ${data.name}`,
      });

      // redirect
      if (data.role !== "customer") {
        setLocation("/admin");
      } else {
        setLocation("/");
      }
    },

    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid login",
      });
    },
  });

  // =========================
  // REGISTER
  // =========================
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterInput) => {
      const res = await fetch(api.auth.register.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Registration failed");
      }

      return api.auth.register.responses[201].parse(await res.json());
    },

    onSuccess: (data) => {
      queryClient.setQueryData([api.auth.me.path], data);

      toast({
        title: "Account created",
        description: "Welcome to Orivya",
      });

      setLocation("/");
    },

    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Try again",
      });
    },
  });

  // =========================
  // LOGOUT
  // =========================
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch(api.auth.logout.path, {
        method: "POST",
        credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null);
      toast({ title: "Signed out" });
      setLocation("/auth");
    },
  });

  return {
    user,
    isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
