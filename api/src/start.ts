import listingsAPI from "./listings-api/app";
import listingsStatePM from "./listings-state-pm/app";
import purchasesStatePM from "./purchases-state-pm/app";

console.log(`Starting: ${process.env.APP_NAME}`);
switch (process.env.APP_NAME) {
  case `listings-api`:
    listingsAPI();
    break;
  case `listings-state-pm`:
    listingsStatePM();
    break;
  case `purchases-state-pm`:
    purchasesStatePM();
    break;
  default:
    console.log(`App not found: ${process.env.APP_NAME}`);
}
