import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { getListings } from "@/lib/redux/thunks";
import { FilterBy } from "@/types";
import { NavDropdown } from "react-bootstrap";

const mapFilterBy = (filterBy: FilterBy) => {
  switch (filterBy) {
    case FilterBy.All:
      return "Filter By";
    case FilterBy.UserAll:
      return "Yours";
    case FilterBy.Active:
      return "Your Active";
    case FilterBy.Archived:
      return "Your Archived";
    case FilterBy.Purchased:
      return "Your Purchased";
    case FilterBy.Sold:
      return "Your Sold";
  }
};

function filterDropdown() {
  const { lastFilterBy } = useAppSelector((state) => state.listingsStore);
  const dispatch = useAppDispatch();

  return (
    <NavDropdown title={mapFilterBy(lastFilterBy)}>
      <NavDropdown.Item onClick={() => dispatch(getListings(FilterBy.All))}>
        {mapFilterBy(FilterBy.All)}
      </NavDropdown.Item>
      <NavDropdown.Item onClick={() => dispatch(getListings(FilterBy.Active))}>
        {mapFilterBy(FilterBy.Active)}
      </NavDropdown.Item>
      <NavDropdown.Item onClick={() => dispatch(getListings(FilterBy.Sold))}>
        {mapFilterBy(FilterBy.Sold)}
      </NavDropdown.Item>
      <NavDropdown.Item
        onClick={() => dispatch(getListings(FilterBy.Purchased))}
      >
        {mapFilterBy(FilterBy.Purchased)}
      </NavDropdown.Item>
      <NavDropdown.Item
        onClick={() => dispatch(getListings(FilterBy.Archived))}
      >
        {mapFilterBy(FilterBy.Archived)}
      </NavDropdown.Item>
      <NavDropdown.Item onClick={() => dispatch(getListings(FilterBy.UserAll))}>
        {mapFilterBy(FilterBy.UserAll)}
      </NavDropdown.Item>
    </NavDropdown>
  );
}

export default filterDropdown;
