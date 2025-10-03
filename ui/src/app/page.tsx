"use client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./page.css";
import MainPage from "@/pages/Main";
import { AuthProvider } from "@/providers/AuthProvider";
import Auth0Provider from "@/providers/Auth0Provider";
import StoreProvider from "../providers/StoreProvider";

export default function Page() {
  return (
    <Auth0Provider>
      <AuthProvider>
        <StoreProvider>
          <MainPage />
        </StoreProvider>
      </AuthProvider>
    </Auth0Provider>
  );
}
