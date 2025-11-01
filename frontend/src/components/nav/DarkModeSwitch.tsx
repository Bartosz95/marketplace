import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setTheme } from "@/lib/redux/listingsSlice";
import { listingStoreSelector } from "@/lib/redux/selectors";
import { Form } from "react-bootstrap";

function DarkModeSwitch() {
  const { theme } = useAppSelector(listingStoreSelector);
  const dispatch = useAppDispatch();
  return (
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
  );
}

export default DarkModeSwitch;
