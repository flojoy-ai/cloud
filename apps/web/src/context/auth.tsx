import { useQuery } from "@tanstack/react-query";
import { createContext } from "react";
import { User } from "lucia";
import { getUserQueryOpts } from "@/lib/queries/user";

export interface AuthContext {
  user: User | undefined;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useQuery(getUserQueryOpts());

  return (
    <AuthContext.Provider value={{ user: user ?? undefined, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
