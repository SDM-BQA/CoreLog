import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import client from "./@configs/Apollo";
import { ApolloProvider } from "@apollo/client/react";
import { Provider } from "react-redux";
import { store } from "./@store";

createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={client}>
    <Provider store={store}>
      <App />
    </Provider>
  </ApolloProvider>,
);
