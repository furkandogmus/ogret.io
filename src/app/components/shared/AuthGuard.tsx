import { Navigate } from "react-router";
import { useAuth } from "../../providers/AuthProvider";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  role?: "STUDENT" | "TUTOR" | "ADMIN";
}

export function AuthGuard({ children, role }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/giris" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
