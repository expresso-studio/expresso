// components/protected-route.tsx
"use client";

import { useEffect } from "react";
import { useAuthUtils } from "@/hooks/useAuthUtils";
import Loading from "./loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Renders a protected route that requires the user to be authenticated.
 * @param props - The props for the ProtectedRoute component.
 * @returns The rendered protected route.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, loginWithRedirect, error, refreshToken } =
    useAuthUtils();

  useEffect(() => {
    // If not authenticated and not loading, redirect to login
    if (!isLoading && !isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      loginWithRedirect();
    }

    // If there's an error, try to refresh the token once
    if (error && !isLoading) {
      refreshToken();
    }
  }, [isAuthenticated, isLoading, loginWithRedirect, error, refreshToken]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <div className="h-[20vw]">
          <Loading />
        </div>
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // If not authenticated, show a message (this shouldn't display long as we redirect)
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Please log in to access this page...</p>
      </div>
    );
  }

  // If authenticated, render children
  return <>{children}</>;
}
