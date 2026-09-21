import listingsAPI from "./listings-api/app";
import listingsStateProcessManager from "./listings-pm/app";
import userAPI from "./user-api/app";
import userStateProcessManager from "./user-pm/app";
import purchasesStateProcessManager from "./purchases-pm/app";
import paymentProcessManager from "./payment-pm/app";

console.log(`Starting: ${process.env.APP_NAME}`);
switch (process.env.APP_NAME) {
  case `listings-api`:
    listingsAPI();
    break;
  case `listings-pm`:
    listingsStateProcessManager();
    break;
  case `user-api`:
    userAPI();
    break;
  case `user-pm`:
    userStateProcessManager();
    break;
  case `purchases-pm`:
    purchasesStateProcessManager();
    break;
  case `payment-pm`:
    paymentProcessManager();
    break;
  default:
    console.log(`App not found: ${process.env.APP_NAME}`);
}
