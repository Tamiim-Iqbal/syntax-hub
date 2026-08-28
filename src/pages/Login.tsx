import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { GoogleLogin } from "@react-oauth/google";

import { useAuth } from "../context/useAuth";

import "./Auth.css";

function Login() {
  const {
    login,
    loginWithGoogle,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [googleSubmitting, setGoogleSubmitting] =
    useState(false);

  const [googleWidth, setGoogleWidth] =
    useState(364);

  const from =
    (location.state as {
      from?: string;
    } | null)?.from ?? "/courses";

  /* =========================================
     RESPONSIVE GOOGLE BUTTON WIDTH
  ========================================= */

  useEffect(() => {
    const updateGoogleWidth = () => {
      const availableWidth =
        window.innerWidth - 72;

      const width = Math.min(
        364,
        Math.max(200, availableWidth)
      );

      setGoogleWidth(width);
    };

    updateGoogleWidth();

    window.addEventListener(
      "resize",
      updateGoogleWidth
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateGoogleWidth
      );
    };
  }, []);

  /* =========================================
     EMAIL + PASSWORD LOGIN
  ========================================= */

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await login(
        email,
        password
      );

      navigate(from, {
        replace: true,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to login"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================
     GOOGLE LOGIN
  ========================================= */

  const handleGoogleSuccess = async (
    credentialResponse: {
      credential?: string;
    }
  ) => {
    if (!credentialResponse.credential) {
      setError(
        "Google login failed. Please try again."
      );

      return;
    }

    setError("");
    setGoogleSubmitting(true);

    try {
      await loginWithGoogle(
        credentialResponse.credential
      );

      navigate(from, {
        replace: true,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to login with Google"
      );
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleSubmitting(false);

    setError(
      "Google login failed. Please try again."
    );
  };

  return (
    <main className="auth-page">
      <section
        className="auth-card"
        aria-labelledby="login-title"
      >
        <span className="section-label">
          WELCOME BACK
        </span>

        <h1 id="login-title">
          Login to SyntaxHub
        </h1>

        <p>
          Continue your learning journey.
        </p>

        {error && (
          <div
            className="auth-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* =====================================
            EMAIL + PASSWORD LOGIN
        ===================================== */}

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          <label htmlFor="login-email">
            Email
          </label>

          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
            autoComplete="email"
          />

          <label htmlFor="login-password">
            Password
          </label>

          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
            minLength={8}
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={
              submitting ||
              googleSubmitting
            }
          >
            {submitting
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        {/* =====================================
            DIVIDER
        ===================================== */}

        <div
          className="auth-divider"
          aria-hidden="true"
        >
          <span>OR</span>
        </div>

        {/* =====================================
            GOOGLE LOGIN
        ===================================== */}

        <div className="auth-google">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            text="continue_with"
            shape="rectangular"
            size="large"
            width={googleWidth}
          />
        </div>

        {googleSubmitting && (
          <p
            className="auth-loading"
            aria-live="polite"
          >
            Logging in with Google...
          </p>
        )}

        {/* =====================================
            REGISTER
        ===================================== */}

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Login;