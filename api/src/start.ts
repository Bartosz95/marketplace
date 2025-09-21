import listingAPI from "./listings-api/app";
import listingStatePM from "./listings-state-pm/app";
import imagesAPI from "./images-api/app";

console.log(`Starting: ${process.env.APP_NAME}`);
switch (process.env.APP_NAME) {
  case `listings-api`:
    listingAPI();
    break;
  case `listings-state-pm`:
    listingStatePM();
    break;
  case `images-api`:
    imagesAPI();
    break;
  default:
    console.log(`App not found: ${process.env.APP_NAME}`);
}
