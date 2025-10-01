import {
  AppState,
  LogoutOptions,
  RedirectLoginOptions,
  User,
} from "@auth0/auth0-react";
import { createContext, useContext } from "react";

export type DataContextType = {
  token: string | undefined;
  isAuthenticated: boolean;
  loginWithRedirect: (
    options?: RedirectLoginOptions<AppState> | undefined
  ) => Promise<void>;
  user: User | undefined;
  logout: (options?: LogoutOptions | undefined) => Promise<void>;
};

export const AuthContext = createContext<DataContextType | undefined>(
  undefined
);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useData must be used inside DataProvider");
  }
  return context;
};
