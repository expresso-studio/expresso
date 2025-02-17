"use client";

import { Auth0Provider } from "@auth0/auth0-react";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";


const domain = "dev-djxjq0rkeitdjudc.us.auth0.com";
const clientId = "J4p8F0KCAaBczHInf778XWC4OKh6Hjmp";

export default function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();

    const onRedirectCallback = (appState: any) => {
        router.push(appState?.returnTo || "/dashboard");
    };
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: typeof window !== "undefined" ? window.location.origin : "",
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
}
