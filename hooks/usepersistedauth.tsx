import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function usePersistedAuth() {
  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const [cachedUser, setCachedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user data is cached
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      setCachedUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem("authUser", JSON.stringify(user));
      setCachedUser(user);
    }
  }, [isAuthenticated, user]);

  return {
    user: cachedUser,
    isAuthenticated: !!cachedUser,
    isLoading: loading || isLoading,
    loginWithRedirect,
  };
}
