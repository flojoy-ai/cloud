import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { client } from "./lib/client";
import { User } from "lucia";

export interface AuthContext {
  user: User | undefined;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useQuery({
    queryFn: async () => {
      const { data } = await client.user.index.get();
      console.log(data);
      return data;
    },
    queryKey: ["user"],
    retry: false,
  });

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
