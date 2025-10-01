"use client";
import { Auth0Provider } from "@auth0/auth0-react";
import { ReactNode } from "react";

type Props = { children: ReactNode };

export default function AuthProvider({ children }: Props) {
  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
      authorizationParams={{
        redirect_uri: process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI,
      }}
    >
      {children}
    </Auth0Provider>
  );
}
