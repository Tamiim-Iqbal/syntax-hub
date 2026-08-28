import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./index.css";
import App from "./App";

import { LanguageProvider } from "./context/LanguageProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import { AuthProvider } from "./context/AuthProvider";

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(
  document.getElementById("root")!
).render(
  <StrictMode>
    <GoogleOAuthProvider
      clientId={googleClientId}
    >
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);