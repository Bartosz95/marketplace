"use client";
import { configureApi } from "@/lib/apiRequest";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type Props = { children: ReactNode };
type AuthSession = {
  sessionExpired: boolean;
  setSessionExpired: (expired: boolean) => void;
};

const AuthSessionContext = createContext<AuthSession | undefined>(undefined);

export function useAuthSession(): AuthSession {
  const context = useContext(AuthSessionContext);
  if (!context) {
    throw new Error("useAuthSession must be used within AuthProvider");
  }
  return context;
}

const authenticationErrors = new Set([
  "consent_required",
  "interaction_required",
  "invalid_grant",
  "login_required",
  "missing_refresh_token",
]);

function isAuthenticationError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;

  const code =
    "error" in error ? error.error : "code" in error ? error.code : undefined;
  return typeof code === "string" && authenticationErrors.has(code);
}

function AuthApiSetup() {
  const { getAccessTokenSilently } = useAuth0();
  const { setSessionExpired } = useAuthSession();

  useEffect(() => {
    configureApi(async () => {
      try {
        const token = await getAccessTokenSilently();
        setSessionExpired(false);
        return token;
      } catch (error) {
        if (isAuthenticationError(error)) setSessionExpired(true);
        throw error;
      }
    });
  }, [getAccessTokenSilently, setSessionExpired]);
  return null;
}

export default function AuthProvider({ children }: Props) {
  const [sessionExpired, setSessionExpired] = useState(false);

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
      <AuthSessionContext.Provider value={{ sessionExpired, setSessionExpired }}>
        <AuthApiSetup />
        {children}
      </AuthSessionContext.Provider>
    </Auth0Provider>
  );
}
