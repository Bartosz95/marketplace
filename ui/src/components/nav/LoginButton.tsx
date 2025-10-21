"use client";
import React, { useState } from "react";
import { Button, Dropdown, Image } from "react-bootstrap";
import ViewProfile from "../cell/ViewProfileModal";
import { useAuth0 } from "@auth0/auth0-react";

function LoginButton() {
  const [showProfile, setShowProfile] = useState(false);
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  return (
    <div className="me-3">
      {!isAuthenticated ? (
        <Button onClick={() => loginWithRedirect()}>Log In</Button>
      ) : (
        <>
          <Dropdown>
            <Dropdown.Toggle id="dropdown-basic">
              {user?.nickname}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setShowProfile(true)}>
                Profile
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() =>
                  logout({
                    logoutParams: { returnTo: window.location.origin },
                  })
                }
              >
                Log Out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          {user && (
            <ViewProfile
              show={showProfile}
              handleClose={() => setShowProfile(false)}
              user={user}
            />
          )}
        </>
      )}
    </div>
  );
}

export default LoginButton;
