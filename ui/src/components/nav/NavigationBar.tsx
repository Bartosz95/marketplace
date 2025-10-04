import { Navbar } from "react-bootstrap";
import Login from "@/components/nav/LoginButton";
import { useAppSelector } from "@/lib/redux/hooks";
import { useAuth0 } from "@auth0/auth0-react";
import CreateListing from "./CreateListingModal";
import FilterDropdown from "./FilterDropdown";
import CreateListingButton from "./CreateListingButton";
import LoginToAddListingButton from "./LoginToAddListingButton";
import DarkModeSwitch from "./DarkModeSwitch";

function NavigationBar() {
  const { isAuthenticated } = useAuth0();

  const { theme } = useAppSelector((state) => state.listingsStore);

  const createListingButton = isAuthenticated ? (
    <CreateListingButton />
  ) : (
    <LoginToAddListingButton />
  );

  return (
    <Navbar
      bg={theme}
      variant={theme}
      expand="lg"
      className="bg-body-tertiary d-flex gap-3 mb-2 "
    >
      <Navbar.Brand className="ms-3">Marketplace</Navbar.Brand>
      {createListingButton}
      {isAuthenticated && <FilterDropdown />}
      <CreateListing />
      <DarkModeSwitch />
      <Login />
    </Navbar>
  );
}

export default NavigationBar;
