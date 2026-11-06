"use client";
import React, { useState } from "react";
import { Button, NavDropdown } from "react-bootstrap";
import ViewProfile from "@/components/cell/ViewProfileModal";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthSession } from "@/providers/AuthProvider";

function LoginButton() {
  const [showProfile, setShowProfile] = useState(false);
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  const { sessionExpired } = useAuthSession();

  if (sessionExpired) {
    return (
      <>
        <span className="align-self-center">
          Your session expired. Please sign in again.
        </span>
        <Button
          onClick={() =>
            loginWithRedirect({ authorizationParams: { prompt: "login" } })
          }
        >
          Sign in again
        </Button>
      </>
    );
  }

  return !isAuthenticated ? (
    <Button onClick={() => loginWithRedirect()}>Login</Button>
  ) : (
    <>
      <NavDropdown title={user?.nickname}>
        <NavDropdown.Item onClick={() => setShowProfile(true)}>
          Profile
        </NavDropdown.Item>
        <NavDropdown.Item
          onClick={() =>
            logout({
              logoutParams: { returnTo: window.location.origin },
            })
          }
        >
          Log Out
        </NavDropdown.Item>
      </NavDropdown>
      {user && (
        <ViewProfile
          show={showProfile}
          handleClose={() => setShowProfile(false)}
          user={user}
        />
      )}
    </>
  );
}

export default LoginButton;
