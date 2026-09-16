import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./index.css";
import App from "./App";
import { getCourses } from "./services/courseService";

import { LanguageProvider } from "./context/LanguageProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import { AuthProvider } from "./context/AuthProvider";

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Start the public course request as early as possible on course-heavy routes.
// Home/Courses will reuse the same promise, so this does not create a duplicate request.
if (window.location.pathname === "/" || window.location.pathname === "/courses") {
  void getCourses().catch(() => {
    // The page performs its own error handling/retry.
  });
}

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