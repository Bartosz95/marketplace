"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Alert, Container, Pagination } from "react-bootstrap";
import ListingCell from "@/components/cell/ListingCell";
import ViewListingModal from "@/components/cell/ViewListingModal";
import { apiRequest, configureApi } from "@/lib/apiRequest";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setOffset, setActivePage } from "@/lib/redux/listingsSlice";
import { listingStoreSelector } from "@/lib/redux/selectors";

export default function Page() {
  const dispatch = useAppDispatch();
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const { listings, limit, activePage, pagesNumbers, user } =
    useAppSelector(listingStoreSelector);
  const [paymentNotice, setPaymentNotice] = useState<
    { status: "paid" | "pending" | "failed" } | { status: "error" } | undefined
  >();
  const reconciledPurchaseId = useRef<string | null>(null);

  useEffect(() => {
    configureApi(getAccessTokenSilently);
    if (isLoading || !isAuthenticated) return;

    const params = new URLSearchParams(window.location.search);
    const purchaseId = params.get("purchase_id");
    if (params.get("payment") !== "success" || !purchaseId) return;
    if (reconciledPurchaseId.current === purchaseId) return;
    reconciledPurchaseId.current = purchaseId;

    let cancelled = false;
    const reconcilePayment = async () => {
      for (let attempt = 0; attempt < 12; attempt += 1) {
        const result = await apiRequest.get<{
          status: "paid" | "pending" | "failed";
        }>(`/payments/purchases/${purchaseId}/status`);
        if (cancelled) return;
        setPaymentNotice(result);
        if (result.status !== "pending") return;
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    };

    reconcilePayment().catch((error) => {
      if (!cancelled) {
        console.error("Failed to reconcile payment status", error);
        setPaymentNotice({ status: "error" });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [getAccessTokenSilently, isAuthenticated, isLoading]);

  const Pages = (
    <Container className="d-flex justify-content-center mt-3">
      <Pagination>
        {pagesNumbers.map((pageNumber) => (
          <Pagination.Item
            key={pageNumber}
            active={pageNumber === activePage}
            onClick={() => changePage(pageNumber)}
          >
            {pageNumber}
          </Pagination.Item>
        ))}
      </Pagination>
    </Container>
  );

  const changePage = (number: number) => {
    dispatch(setOffset(limit * (number - 1)));
    dispatch(setActivePage(number));
  };

  return (
    <>
      {paymentNotice && (
        <Alert
          variant={
            paymentNotice.status === "paid"
              ? "success"
              : paymentNotice.status === "error" ||
                  paymentNotice.status === "failed"
                ? "warning"
                : "info"
          }
          dismissible
          onClose={() => setPaymentNotice(undefined)}
        >
          {paymentNotice.status === "paid" &&
            "Payment confirmed. The listing status is updating."}
          {paymentNotice.status === "pending" &&
            "Payment is still processing. Check back in a moment if this message remains."}
          {paymentNotice.status === "failed" && "The payment was not completed."}
          {paymentNotice.status === "error" &&
            "Could not verify your payment status. Refresh this page to try again."}
        </Alert>
      )}
      <ViewListingModal />
      <Container
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {listings.map((listing) => (
          <ListingCell listing={listing} key={listing.listingId} user={user} />
        ))}
      </Container>
      {Pages}
    </>
  );
}
