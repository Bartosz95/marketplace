import listingApi from "./listings-api/app";
import listingStatePM from "./listing-state-pm/app";

console.log(`Starting: ${process.env.APP_NAME}`);
switch (process.env.APP_NAME) {
  case `listings-api`:
    listingApi();
    break;
  case `listings-state-pm`:
    listingStatePM();
    break;
  default:
    console.log(`App not found: ${process.env.APP_NAME}`);
}
