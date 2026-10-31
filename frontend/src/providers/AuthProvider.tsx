"use client";
import { configureApi } from "@/lib/apiRequest";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { ReactNode, useEffect } from "react";

type Props = { children: ReactNode };

function AuthApiSetup() {
  const { getAccessTokenSilently } = useAuth0();
  useEffect(() => {
    console.log("Configuring API with Auth0 token getter");
    configureApi(getAccessTokenSilently);
  }, [getAccessTokenSilently]);
  return null;
}

export default function AuthProvider({ children }: Props) {
  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
      authorizationParams={{
        redirect_uri: process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI,
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <AuthApiSetup />
      {children}
    </Auth0Provider>
  );
}
