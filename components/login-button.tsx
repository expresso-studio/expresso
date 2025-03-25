"use client";

import { useAuth0 } from "@auth0/auth0-react";
import LoginButtonUI from "./ui/loginbutton-ui";

export default function LoginButton() {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  return isAuthenticated ? (
    <LoginButtonUI onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
      Log Out
    </LoginButtonUI>
  ) : (
    <LoginButtonUI className = "flex items-center gap-2" onClick={() => loginWithRedirect()}>
      <span className = "text-2xl">
        Start Here
      </span>
      <img src="/right-arrow.svg" alt = "Right Arrow" className = "w-6 h-6" />
    </LoginButtonUI>
  );
}
