import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setActivePage } from "@/lib/redux/listingsSlice";
import { listingStoreSelector } from "@/lib/redux/selectors";
import { getListings } from "@/lib/redux/thunks";
import { FilterBy } from "@/types";
import { NavDropdown } from "react-bootstrap";

const mapFilterBy = (filterBy: FilterBy) => {
  switch (filterBy) {
    case FilterBy.All:
      return "Filter By";
    case FilterBy.UserAll:
      return "All Yours";
    case FilterBy.UserActive:
      return "Your Active";
    case FilterBy.UserArchived:
      return "Your Archived";
    case FilterBy.UserPurchased:
      return "Your Purchased";
    case FilterBy.UserSold:
      return "Your Sold";
  }
};

function FilterDropdown() {
  const { lastFilterBy } = useAppSelector(listingStoreSelector);
  const dispatch = useAppDispatch();

  return (
    <NavDropdown title={mapFilterBy(lastFilterBy)}>
      <NavDropdown.Item
        onClick={async () => {
          dispatch(setActivePage(1));
          await dispatch(getListings(FilterBy.All));
        }}
      >
        All
      </NavDropdown.Item>
      <NavDropdown.Item
        onClick={async () => {
          dispatch(setActivePage(1));
          await dispatch(getListings(FilterBy.UserAll));
        }}
      >
        {mapFilterBy(FilterBy.UserAll)}
      </NavDropdown.Item>
      <NavDropdown.Item
        onClick={async () => {
          dispatch(setActivePage(1));
          await dispatch(getListings(FilterBy.UserActive));
        }}
      >
        {mapFilterBy(FilterBy.UserActive)}
      </NavDropdown.Item>
      <NavDropdown.Item
        onClick={async () => {
          dispatch(setActivePage(1));
          await dispatch(getListings(FilterBy.UserSold));
        }}
      >
        {mapFilterBy(FilterBy.UserSold)}
      </NavDropdown.Item>
      <NavDropdown.Item
        onClick={async () => {
          dispatch(setActivePage(1));
          await dispatch(getListings(FilterBy.UserPurchased));
        }}
      >
        {mapFilterBy(FilterBy.UserPurchased)}
      </NavDropdown.Item>
      <NavDropdown.Item
        onClick={async () => {
          dispatch(setActivePage(1));
          await dispatch(getListings(FilterBy.UserArchived));
        }}
      >
        {mapFilterBy(FilterBy.UserArchived)}
      </NavDropdown.Item>
    </NavDropdown>
  );
}

export default FilterDropdown;
