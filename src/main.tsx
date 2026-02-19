import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import client from "./@configs/Apollo";
import { ApolloProvider } from "@apollo/client/react";

createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
);
