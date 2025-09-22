"use client";
import { Auth0Provider } from "@auth0/auth0-react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
      authorizationParams={{
        redirect_uri: "http://localhost:3001",
      }}
    >
      {children}
    </Auth0Provider>
  );
}
