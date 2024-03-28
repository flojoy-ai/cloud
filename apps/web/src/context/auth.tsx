import { useQuery } from "@tanstack/react-query";
import { createContext } from "react";
import { client } from "@/lib/client";
import { User } from "lucia";

export interface AuthContext {
  user: User | undefined;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useQuery({
    queryFn: async () => {
      const { data } = await client.user.index.get();
      return data;
    },
    queryKey: ["user"],
    retry: false,
  });

  return (
    <AuthContext.Provider value={{ user: user ?? undefined, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
