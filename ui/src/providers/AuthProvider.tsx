import { useAuth0 } from "@auth0/auth0-react";
import {
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AuthContext } from "./AuthContext";

type Props = { children: ReactNode };

export const AuthProvider = ({ children }: Props) => {
  const  auth = useAuth0();
  const [token, setToken] = useState<string | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await auth.getAccessTokenSilently({
          authorizationParams: {
            audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
          }
        });
        setToken(token);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, token }}>
      {children}
    </AuthContext.Provider>
  );
};
