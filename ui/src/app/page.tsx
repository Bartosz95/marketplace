"use client";
import MainPage from "@/pages/MainPage";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MyListings from "@/pages/MyListingsPage";
import NavigationBar from "@/components/NavigationBar";

export default function Page() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <NavigationBar />
                <MainPage />
              </>
            }
          />
          <Route
            path="/my"
            element={
              <>
                <NavigationBar />
                <MyListings />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}
