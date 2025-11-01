import NavigationBar from "@/components/nav/NavigationBar";
import AuthProvider from "@/providers/AuthProvider";
import StoreProvider from "@/providers/StoreProvider";
import { ReactNode } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./global.css";

type Props = { children: ReactNode };

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <head>
        <title>Marketplace</title>
      </head>
      <body>
        <AuthProvider>
          <StoreProvider>
            <header>
              <NavigationBar />
            </header>
            <main>{children}</main>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
