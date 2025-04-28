//app/auth0-provider.tsx
"use client";

import { Auth0Provider, User } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";

const domain = "dev-djxjq0rkeitdjudc.us.auth0.com";
const clientId = "J4p8F0KCAaBczHInf778XWC4OKh6Hjmp";

interface AppState {
  returnTo?: string;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // After redirect, sync user with our database.
  const onRedirectCallback = async (appState?: AppState, user?: User) => {
    if (user) {
      console.log("User authenticated:", user.sub);
      try {
        await fetch("/api/users/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sub: user.sub, // Use Auth0's unique user id as the primary key.
            email: user.email,
            name: user.nickname,
          }),
        });
      } catch (error) {
        console.error("Error syncing user", error);
      }
    }
    router.push(appState?.returnTo || "/dashboard");
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri:
          typeof window !== "undefined" ? window.location.origin : "",
      }}
      onRedirectCallback={onRedirectCallback}
      cacheLocation="localstorage" // Use localStorage instead of memory for better persistence
      useRefreshTokens={true} // Enable refresh tokens
      skipRedirectCallback={
        typeof window !== "undefined" &&
        window.location.pathname === "/api/auth/callback"
      }
    >
      {children}
    </Auth0Provider>
  );
}
