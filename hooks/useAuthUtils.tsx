// hooks/useAuthUtils.ts
"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuthUtils() {
  const {
    isAuthenticated,
    isLoading,
    error,
    getAccessTokenSilently,
    loginWithRedirect,
    logout,
    user,
  } = useAuth0();
  const [tokenError, setTokenError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Handle auth errors
  useEffect(() => {
    if (error) {
      console.error("Auth error detected:", error);
      
      // If error is related to login required, redirect to login
      if (error.message.includes("login required")) {
        loginWithRedirect();
      }
    }
  }, [error, loginWithRedirect]);

  // Function to refresh token
  const refreshToken = async () => {
    if (isRefreshing || !isAuthenticated) return;
    
    setIsRefreshing(true);
    try {
      console.log("Attempting to refresh token...");
      const token = await getAccessTokenSilently({
        detailedResponse: true,
        timeoutInSeconds: 60,
      });
      console.log("Token refreshed successfully");
      setTokenError(null);
      return token;
    } catch (refreshError) {
      console.error("Failed to refresh token:", refreshError);
      setTokenError(refreshError as Error);
      
      // If refresh fails critically, trigger login
      if ((refreshError as Error).message.includes("login required")) {
        loginWithRedirect({
          appState: { returnTo: window.location.pathname },
        });
      }
      return null;
    } finally {
      setIsRefreshing(false);
    }
  };

  // Set up periodic token refresh
  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    
    // Initial token refresh
    refreshToken();
    
    // Set up interval for token refresh (every 20 minutes)
    const intervalId = setInterval(() => {
      refreshToken();
    }, 1000 * 60 * 20); // 20 minutes
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, isLoading]);

  return {
    isAuthenticated,
    isLoading,
    user,
    error: error || tokenError,
    refreshToken,
    isRefreshing,
    loginWithRedirect: () => 
      loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      }),
    logout: () => 
      logout({ 
        logoutParams: { 
          returnTo: typeof window !== "undefined" ? window.location.origin : "" 
        } 
      }),
  };
}