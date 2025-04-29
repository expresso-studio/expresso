"use client";

import { useAuth0 } from "@auth0/auth0-react";
import LoginButtonUI from "./ui/loginbutton-ui";
import { ChevronRight } from "lucide-react";

/**
 * Renders a login or logout button based on the user's authentication status.
 * @returns The rendered login or logout button.
 */
export default function LoginButton() {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  return isAuthenticated ? (
    <LoginButtonUI
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
    >
      Log Out
    </LoginButtonUI>
  ) : (
    <LoginButtonUI
      className="flex items-center gap-2"
      onClick={() => loginWithRedirect()}
    >
      <span className="text-2xl">Start Here</span>
      <ChevronRight />
    </LoginButtonUI>
  );
}
