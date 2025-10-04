import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setTheme } from "@/lib/redux/listingsSlice";
import { Nav, Form } from "react-bootstrap";

function DarkModeSwitch() {
  const { theme } = useAppSelector((state) => state.listingsStore);
  const dispatch = useAppDispatch();
  return (
    <Nav className="ms-auto">
      <Form>
        <Form.Check
          type="switch"
          id="dark-mode-switch"
          label="Dark Mode"
          checked={theme === "dark"}
          onChange={() =>
            dispatch(setTheme(theme === "light" ? "dark" : "light"))
          }
        />
      </Form>
    </Nav>
  );
}

export default DarkModeSwitch;
