import React, { useContext, useReducer } from "react";
import {default as PageWrapper }from "@/components/Page";
import { Page } from "./context/requestContext";
import SelectPayees from "./pages/SelectPayees";
import SelectAmount from "./pages/SelectAmount";
import Confirm from "./pages/Confirmation";
import { RequestProvider, RequestContext } from "./context/requestContext";

const CurrentPage = () => {
  const { state } = useContext(RequestContext);
  switch (state.currentPage) {
    case Page.SelectPayees:
      return <SelectPayees />;
    case Page.SelectAmount:
      return <SelectAmount />;
    case Page.Confirmation:
      return <Confirm />;
  }
}

const Request = () => {
  return (
    <PageWrapper title="Request">
      <RequestProvider>
        <CurrentPage />
      </RequestProvider>
    </PageWrapper>
  );
};

export default Request;
