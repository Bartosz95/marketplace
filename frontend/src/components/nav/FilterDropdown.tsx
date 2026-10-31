import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { listingStoreSelector } from "@/lib/redux/selectors";
import { getListings, getUserListings } from "@/lib/redux/thunks";
import { FilterBy } from "@/types";
import { NavDropdown } from "react-bootstrap";

const mapFilterBy = (filterBy: FilterBy) => {
  switch (filterBy) {
    case FilterBy.All:
      return "Filter By";
    case FilterBy.UserAll:
      return "All Yours";
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

function FilterDropdown() {
  const { lastFilterBy } = useAppSelector(listingStoreSelector);
  const dispatch = useAppDispatch();

  return (
    <NavDropdown title={mapFilterBy(lastFilterBy)}>
      <NavDropdown.Item onClick={async () => await dispatch(getListings())}>
        All
      </NavDropdown.Item>
      <NavDropdown.Item
        onClick={async () => await dispatch(getUserListings(FilterBy.UserAll))}
      >
        {mapFilterBy(FilterBy.UserAll)}
      </NavDropdown.Item>
      <NavDropdown.Item
        onClick={async () => await dispatch(getUserListings(FilterBy.Active))}
      >
        {mapFilterBy(FilterBy.Active)}
      </NavDropdown.Item>
      <NavDropdown.Item
        onClick={async () => await dispatch(getUserListings(FilterBy.Sold))}
      >
        {mapFilterBy(FilterBy.Sold)}
      </NavDropdown.Item>
      <NavDropdown.Item
        onClick={async () =>
          await dispatch(getUserListings(FilterBy.Purchased))
        }
      >
        {mapFilterBy(FilterBy.Purchased)}
      </NavDropdown.Item>
      <NavDropdown.Item
        onClick={async () => await dispatch(getUserListings(FilterBy.Archived))}
      >
        {mapFilterBy(FilterBy.Archived)}
      </NavDropdown.Item>
    </NavDropdown>
  );
}

export default FilterDropdown;
