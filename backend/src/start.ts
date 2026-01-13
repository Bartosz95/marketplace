import listingsAPI from "./listings-api/app";
import listingsStateProcessManager from "./listings-state-pm/app";
import purchasesStateProcessManager from "./purchases-state-pm/app";
import paymentProcessManager from "./payment-pm/app";

console.log(`Starting: ${process.env.APP_NAME}`);
switch (process.env.APP_NAME) {
  case `listings-api`:
    listingsAPI();
    break;
  case `listings-state-pm`:
    listingsStateProcessManager();
    break;
  case `purchases-state-pm`:
    purchasesStateProcessManager();
    break;
  case `payment-pm`:
    paymentProcessManager();
    break;
  default:
    console.log(`App not found: ${process.env.APP_NAME}`);
}
