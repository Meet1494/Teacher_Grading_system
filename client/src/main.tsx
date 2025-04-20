import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { StrictMode } from "react";
import { AuthWrapper } from "./lib/auth-wrapper";

// Wrap the entire application with StrictMode for better development experience
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthWrapper>
      <App />
    </AuthWrapper>
  </StrictMode>
);
