import { createRoot } from "react-dom/client";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { App } from "./App";
import client from "./@configs/Apollo";
import { ApolloProvider } from "@apollo/client/react";
import { Provider } from "react-redux";
import { store } from "./@store";
import { onRouterReady } from "./pages";

createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={client}>
  <Provider store={store}>
    <App />
  </Provider>
  </ApolloProvider>
);

// Remove the HTML loading screen once the first real screen is ready.
// It stays for at least MIN_SPLASH_MS so it never just flickers past.
const MIN_SPLASH_MS = 350;
const splash = document.getElementById("splash");
let splashHidden = false;
const hideSplash = () => {
  if (!splash || splashHidden) return;
  splashHidden = true;
  setTimeout(() => {
    splash.classList.add("hide");
    setTimeout(() => splash.remove(), 450);
  }, Math.max(0, MIN_SPLASH_MS - performance.now()));
};
onRouterReady(() => requestAnimationFrame(() => requestAnimationFrame(hideSplash)));
setTimeout(hideSplash, 6000); // safety net: never leave users stuck on it

// Register the service worker (installable app + offline page). Production only, so dev stays simple.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
  });
}
