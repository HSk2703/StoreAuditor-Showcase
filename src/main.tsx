import { createRoot } from "react-dom/client";
import "./index.css";
import { isPublicAuthRoute, pruneExpiredAuthState } from "@/lib/auth-session";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

if (typeof window !== "undefined" && isPublicAuthRoute(window.location.pathname)) {
  pruneExpiredAuthState();
}

const root = createRoot(rootElement);

void import("./App.tsx").then(({ default: App }) => {
  root.render(<App />);
});
