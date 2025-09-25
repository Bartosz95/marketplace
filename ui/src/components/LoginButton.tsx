"use client";
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "react-bootstrap";

function LoginButton() {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
 console.log(user)
  return (
    <div className="me-3">
      {!isAuthenticated ? (
        <Button onClick={() => loginWithRedirect()}>Log In</Button>
      ) : (
        <Button
          onClick={() =>
            logout({ logoutParams: { returnTo: window.location.origin } })
          }
        >
          Log Out
        </Button>
      )}
    </div>
  );
}

export default LoginButton;
